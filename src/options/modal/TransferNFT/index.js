import React, { useContext, useEffect, useMemo,useRef, useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { TYPE } from 'constants/accountConstants'
import BackIcon from 'img/v2/back-icon-blue.svg'
import CloseIcon from 'img/v2/close-icon-blue.svg'
import isEmpty from 'lodash/isEmpty'
import { setAssets } from 'options/actions/assets'
import { setError } from 'options/actions/error'
import NFTMedia from 'options/components/NFTMedia'
import { GalleryContext } from 'options/galleryContext'
// v2
import { formatLongStringTruncate } from 'options/utils/formatLongString'
import { popupBackgroundRequest } from 'services/request/popup'
import { isArweaveAddress, isEthereumAddress, isSolanaAddress } from 'utils'

import ConfirmTransfer from './ConfirmTransfer'
import TransferFrom from './TransferForm'
import TransferSuccess from './TransferSuccess'

import './index.css'

const TransferNFT = ({
  onClose,
  cardInfo: { txId, name, imageUrl, earnedKoi, totalViews, contentType, address, type }
}) => {
  const history = useHistory()

  const backToGallery = () => {
    onClose()
    history.push('/gallery')
  }

  const formattedName = useMemo(() => formatLongStringTruncate(name, 50), [name])

  const modalRef = useRef(null)

  const [stage, setStage] = useState(1)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [numberToTransfer, setNumberToTransfer] = useState(1)
  const [sendBtnDisable, setSendBtnDisable] = useState(false)

  const assets = useSelector((state) => state.assets)
  const dispatch = useDispatch()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handlePressingEsc = (event) => {
      if (event.defaultPrevented) {
        return // Should do nothing if the default action has been cancelled
      }

      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handlePressingEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handlePressingEsc)
    }
  }, [modalRef])

  const goToNextStage = () => setStage((stage) => stage + 1)

  const handleValidateArAddress = () => {
    let isValid
    
    switch (type) {
      case TYPE.ARWEAVE:  
        isValid = isArweaveAddress(receiverAddress) 
        break
      case TYPE.ETHEREUM:
        isValid = isEthereumAddress(receiverAddress) 
        break
      case TYPE.SOLANA:
        isValid = isSolanaAddress(receiverAddress) 
        break
    }

    if (!isValid) {
      dispatch(setError(chrome.i18n.getMessage('invalidWalletAddress')))
    } else {
      goToNextStage()
    }
  }

  const handleTransferNFT = async () => {
    try {
      setSendBtnDisable(true)
      const res = await popupBackgroundRequest.gallery._transferNFT({
        nftId: txId,
        senderAddress: address,
        recipientAddress: receiverAddress
      })

      // manually update nfts state
      const nfts = assets.nfts.map((nft) => {
        if (nft.txId === txId) nft.isSending = true
        return nft
      })
      dispatch(setAssets({ nfts }))

      setSendBtnDisable(false)
      goToNextStage()
    } catch (error) {
      const nfts = assets.nfts.map((nft) => {
        if (nft.txId === txId) nft.isSending = false
        return nft
      })
      setSendBtnDisable(false)
      dispatch(setError(chrome.i18n.getMessage('somethingWentWrongWhoops')))
    }
  }

  return (
    <div className="new-modal-wrapper">
      <div className="transfer-nft wrapper" ref={modalRef}>
        <section className="new-modal-header">
          <div className="new-modal-header-icon">
            {stage === 2 && <BackIcon onClick={() => setStage(1)} />}
          </div>
          <div className="title">
            {stage === 1 && <>{chrome.i18n.getMessage('transferNFTToFriend')}</>}
            {stage === 2 && <>{chrome.i18n.getMessage('confirmYourTransfer')}</>}
            {stage === 3 && <>{chrome.i18n.getMessage('nftOnItsWay')}</>}
          </div>
          <CloseIcon className="new-modal-header-icon" onClick={onClose} />
        </section>

        <div className="transfer-nft__nft-name-wrapper">
          <div className="transfer-nft__nft-name">{formattedName}</div>
          {stage === 3 && (
            <>
              <span>&nbsp;{chrome.i18n.getMessage('hasBeenSentToLc')}:</span>
            </>
          )}
        </div>

        <div className="transfer-nft container">
          <div className="media">
            <NFTMedia contentType={contentType} source={imageUrl} />
          </div>

          <div className="right-side">
            {stage === 1 && (
              <TransferFrom
                receiverAddress={receiverAddress}
                setReceiverAddress={setReceiverAddress}
                numberToTransfer={numberToTransfer}
                setNumberToTransfer={setNumberToTransfer}
              />
            )}
            {stage === 2 && (
              <ConfirmTransfer receiverAddress={receiverAddress} goBack={() => setStage(1)} />
            )}

            {stage === 3 && (
              <TransferSuccess
                name={formattedName}
                receiverAddress={receiverAddress}
                onClose={onClose}
              />
            )}
          </div>
        </div>

        <div className="button-wrapper">
          {stage === 1 && (
            <button
              onClick={handleValidateArAddress}
              className="submit-btn"
              disabled={isEmpty(receiverAddress)}
            >
              Send NFT
            </button>
          )}
          {stage == 2 && (
            <button
              className="submit-btn"
              onClick={async () => await handleTransferNFT()}
              disabled={sendBtnDisable}
            >
              Send NFT
            </button>
          )}
          {stage == 3 && (
            <button className="submit-btn" onClick={backToGallery}>
              Back To Gallery
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferNFT
