import React, { useState, useEffect, useMemo } from 'react'
import ProgressBar from '@ramonak/react-progress-bar'


import BackIcon from 'img/v2/back-icon-blue.svg'
import CloseIcon from 'img/v2/close-icon-blue.svg'
import ModalBackground from 'img/v2/modal-background.svg'

import Button from 'finnie-v2/components/Button'
import formatNumber from 'finnie-v2/utils/formatNumber'

import arweave from 'services/arweave'

const ONE_MILLION = 1000000

const ConfirmModal = ({ filesSize, numOfNfts, handleConfirmCreateCollection, close, goBack, nfts, resetState }) => {
  const [step, setStep] = useState(1)
  const [arPrice, setArPrice] = useState(0)
  const [displayProgressBar, setDisplayProgressBar] = useState(false)

  const confirmCreateCollection = async () => {
    await handleConfirmCreateCollection()
    resetState()
    setStep(2)
  }

  useEffect(() => {
    const getPrice = async () => {
      let newArPrice = 0.00004

      if (filesSize) {
        newArPrice = await arweave.transactions.getPrice(filesSize) + 0.00004
        newArPrice = arweave.ar.winstonToAr(newArPrice)
      }
      
      setArPrice(newArPrice)
    }

    getPrice()
  }, [filesSize])

  const uploaded = useMemo(() => {
    return nfts.filter(nft => nft.uploaded).length
  }, [nfts])

  return (
    <div className="fixed top-0 left-0 bg-black bg-opacity-25 z-50 w-full h-full flex items-center justify-center">
      <div className="relative w-146.5 h-83 bg-trueGray-100 rounded text-indigo">
        <div className="h-16.75 px-4 shadow-md flex items-center justify-between">
          <BackIcon className="w-7 cursor-pointer" onClick={goBack} />
          <span className="font-semibold text-xl">Confirm Your Collection</span>
          <CloseIcon className="w-7 cursor-pointer" onClick={close} />
        </div>
        {step === 1 && (
          <section className="py-5 text-center text-base px-16.5">
            <>
              <p className="mb-5.5">
                An Atomic NFT is store permanently on Arweave and earns attention rewards forever
                through Koi.
              </p>
              <div className="flex justify-around text-left">
                <div>
                  <div className="font-semibold tracking-finnieSpacing-wide">
                    Files to be minted:
                  </div>
                  <div>{numOfNfts} pieces</div>
                  <div className="font-semibold tracking-finnieSpacing-wide">
                    Size: {formatNumber(filesSize / ONE_MILLION, 2)} MB
                  </div>
                </div>
                <div>
                  <div className="font-semibold tracking-finnieSpacing-wide">Estimated Costs:</div>
                  <div>{numOfNfts} KOII</div>
                  <div>{formatNumber(arPrice, 5)} AR</div>
                  <div className="text-2xs tracking-finnieSpacing-wider text-success-700">
                    Storage Fee
                  </div>
                </div>
              </div>
              <div className="absolute bottom-5.5 w-full flex left-0 justify-center">
                <Button
                  variant="indigo"
                  text="Create Collection"
                  className="font-semibold tracking-wider py-3 rounded"
                  onClick={() => {confirmCreateCollection(); setDisplayProgressBar(true)}}
                  disabled={displayProgressBar}
                />
              </div>
              {displayProgressBar && <ProgressBar bgColor='#49CE8B' completed={uploaded} maxCompleted={nfts.length} customLabel=' '/>}
            </>
          </section>
        )}
        {step === 2 && (
          <section className="">
            <ModalBackground className="absolute top-16.75 left-0" />
            <div className="absolute left-57.75 top-43.75">
              <div className="font-semibold text-xl tracking-finnieSpacing-wide">
                Your edits have been saved!
              </div>
            </div>
            <div className="absolute bottom-5.5 w-full flex left-0 justify-center">
              <Button
                variant="indigo"
                text="OK"
                className="w-43.75 font-semibold tracking-wider py-3 rounded"
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