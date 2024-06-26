import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import ProgressBar from '@ramonak/react-progress-bar'
import BackIcon from 'img/v2/back-icon-blue.svg'
import CloseIcon from 'img/v2/close-icon-blue.svg'
import ModalBackground from 'img/v2/modal-background.svg'
import Button from 'options/components/Button'
import formatNumber from 'options/utils/formatNumber'
import arweave from 'services/arweave'

const ONE_MILLION = 1000000

const ConfirmModal = ({
  filesSize,
  numOfNfts,
  handleConfirmCollection,
  close,
  goBack,
  nfts,
  resetState,
  isUpdate
}) => {
  const history = useHistory()

  const [step, setStep] = useState(1)
  const [arPrice, setArPrice] = useState(0)
  const [displayProgressBar, setDisplayProgressBar] = useState(false)

  const editingCollectionId = useSelector((state) => state.editingCollectionId)

  const confirmCollection = async () => {
    await handleConfirmCollection()
    resetState()
    setDisplayProgressBar(false)
    setStep(2)
  }

  useEffect(() => {
    return () => {
      isUpdate && history.push(`/collections/${editingCollectionId}`)
    }
  }, [])

  useEffect(() => {
    const getPrice = async () => {
      let newArPrice = 0.00004

      if (filesSize) {
        newArPrice = (await arweave.transactions.getPrice(filesSize)) + 0.00004
        newArPrice = arweave.ar.winstonToAr(newArPrice)
      }

      setArPrice(newArPrice)
    }

    getPrice()
  }, [filesSize])

  const uploaded = useMemo(() => {
    return nfts.filter((nft) => nft.uploaded).length
  }, [nfts])

  return (
    <div className="fixed top-0 left-0 bg-black bg-opacity-25 z-50 w-full h-full flex items-center justify-center">
      <div className="relative w-146.5 h-83 bg-trueGray-100 rounded text-indigo">
        <div className="h-16.75 px-4 shadow-md flex items-center justify-between">
          {step !== 2 ? (
            <BackIcon className="w-7 cursor-pointer" onClick={goBack} />
          ) : (
            <div className="w-7"></div>
          )}
          <span className="font-semibold text-xl">
            {step === 2 ? 'Create a Collection' : 'Confirm Your Collection'}
          </span>
          <CloseIcon className="w-7 cursor-pointer" onClick={close} />
        </div>
        {displayProgressBar && (
          <ProgressBar
            bgColor="#49CE8B"
            completed={uploaded}
            maxCompleted={nfts.length}
            customLabel=" "
            width="100%"
            height="8px"
            borderRadius="0px"
          />
        )}
        {step === 1 && (
          <section className="py-5 text-center text-base px-16.5">
            <>
              <p className="mb-5.5">{chrome.i18n.getMessage('atomicNFTArweave')}</p>
              <div className="flex justify-around text-left">
                <div>
                  <div className="font-semibold tracking-finnieSpacing-wide">
                    {chrome.i18n.getMessage('filesMinted')}
                  </div>
                  <div>
                    {numOfNfts}
                    {' '}{chrome.i18n.getMessage('pieces')}
                  </div>
                  <div className="font-semibold tracking-finnieSpacing-wide">
                    {chrome.i18n.getMessage('size')}{': '}
                    {formatNumber(filesSize / ONE_MILLION, 2)} MB
                  </div>
                </div>
                <div>
                  <div className="font-semibold tracking-finnieSpacing-wide">
                    {chrome.i18n.getMessage('estimatedCosts')}:
                  </div>
                  <div>{numOfNfts} KOII</div>
                  <div>{formatNumber(arPrice, 5)} AR</div>
                  <div className="text-2xs tracking-finnieSpacing-wider text-success-700">
                    {chrome.i18n.getMessage('storageFee')}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-5.5 w-full flex left-0 justify-center">
                <Button
                  variant="inversedIndigo"
                  text={chrome.i18n.getMessage('cancel')}
                  className="tracking-wider py-3 rounded w-42.5 h-10 text-base mr-11"
                  onClick={close}
                  disabled={displayProgressBar}
                />
                <Button
                  variant="indigo"
                  text={
                    isUpdate ? chrome.i18n.getMessage('update') : chrome.i18n.getMessage('confirm')
                  }
                  className="tracking-wider py-3 rounded w-42.5 h-10 text-base"
                  onClick={() => {
                    confirmCollection()
                    setDisplayProgressBar(true)
                  }}
                  disabled={displayProgressBar}
                />
              </div>
            </>
          </section>
        )}
        {step === 2 && (
          <section className="">
            <ModalBackground className="absolute top-16.75 left-0" />
            <div className="absolute left-57.75 top-40">
              <div className="font-semibold text-lg tracking-finnieSpacing-wide">
                {chrome.i18n.getMessage('yourCollectionReady')}
              </div>
              <div className="text-sm tracking-finnieSpacing-wide">
                {chrome.i18n.getMessage('takeTimeToGallery')}
              </div>
            </div>
            <div className="absolute bottom-5.5 w-full flex left-0 justify-center">
              <Button
                variant="indigo"
                text={chrome.i18n.getMessage('okUc')}
                className="w-42.5 h-10 tracking-wider py-3 rounded"
                onClick={close}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ConfirmModal
