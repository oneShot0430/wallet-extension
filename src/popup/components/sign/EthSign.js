import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setError } from 'actions/error'
import { setIsLoading } from 'actions/loading'
import CloseIcon from 'img/v2/close-icon-white.svg'
import storage from 'services/storage'

const EthSign = ({ setError, setIsLoading }) => {
  const [requestData, setRequestData] = useState({})

  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true)
      const request = await storage.generic.get.pendingRequest()
      const {
        requestPayload: { message },
        requestId
      } = request.data

      setRequestData({ requestId, message })

      setIsLoading(false)
    }

    loadRequest()
  }, [])

  const onSign = async () => {
    try {
      setIsLoading(true)

      chrome.runtime.onMessage.addListener(async function (message) {
        if (message.requestId === requestData.requestId) {
          setIsLoading(false)
          await storage.generic.remove.pendingRequest()
          chrome.action.setBadgeText({ text: '' })
          window.close()
        }
      })

      const payload = {
        requestId: requestData.requestId,
        approved: true
      }

      chrome.runtime.sendMessage(payload)
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
    } finally {
      await storage.generic.remove.pendingRequest()
    }
  }

  const onClose = async () => {
    const payload = {
      requestId: requestData.requestId,
      approved: false
    }

    chrome.runtime.sendMessage(payload)

    await storage.generic.remove.pendingRequest()

    window.close()
  }

  return (
    <div className="w-full h-full z-51 m-auto top-0 left-0 fixed flex flex-col items-center">
      <div
        className="relative bg-white shadow-md rounded m-auto flex flex-col items-center"
        style={{ width: '381px', height: '390px' }}
      >
        <div
          className="relative bg-blue-800 w-full flex items-center justify-center"
          style={{ height: '67px' }}
        >
          <div className="font-semibold text-xl text-white leading-6 text-center tracking-finnieSpacing-wide">
            {chrome.i18n.getMessage('signingMessage')}
          </div>
          <CloseIcon
            style={{ width: '30px', height: '30px' }}
            className="absolute top-4 right-4 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="mt-4.5 w-full px-2 font-semibold text-base text-left tracking-finnieSpacing-wide text-indigo">
          {chrome.i18n.getMessage('message')}:
        </div>
        <div className="mt-4.5 px-2 w-full font-normal text-base text-left tracking-finnieSpacing-wide text-indigo break-words">
          {requestData.message}
        </div>
        <div className="absolute bottom-7.25 w-full flex justify-between px-4.5">
          <button
            className="bg-white border-2 border-blue-800 rounded-sm shadow text-base leading-4 text-center text-blue-800"
            style={{ width: '160px', height: '38px' }}
            onClick={onClose}
          >
            {chrome.i18n.getMessage('reject')}
          </button>
          <button
            onClick={onSign}
            className="bg-blue-800 rounded-sm shadow text-base leading-4 text-center text-white"
            style={{ width: '160px', height: '38px' }}
          >
            {chrome.i18n.getMessage('sign')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default connect(null, { setError, setIsLoading })(EthSign)
