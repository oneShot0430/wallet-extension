import { ERROR_MESSAGE } from 'constants/koiConstants'
import { get, isEmpty } from 'lodash'
import { popupAccount } from 'services/account'
import { popupBackgroundRequest as request } from 'services/request/popup'
import storage from 'services/storage'
import { fromWeiToEth } from 'utils'

import { TRANSACTION_TYPE } from './constants'

const useMethod = ({
  setIsLoading,
  requestId,
  setError,
  setShowSigning,
  transactionPayload,
  transactionType,
  contractAddress,
  value,
  customTokenRecipient,
  rawValue,
  setTxId,
  setShowReceipt,
  getFeeInterval,
  totalFee
}) => {
  const handleSendEth = async () => {
    let qty = get(transactionPayload, 'value')
    qty = fromWeiToEth(parseInt(qty, 16))
    const target = get(transactionPayload, 'to')
    const source = get(transactionPayload, 'from')

    return await request.wallet.makeTransfer({
      qty,
      target,
      address: source,
      token: 'ETH'
    })
  }

  const handleSendCustomTokenEth = async () => {
    return await request.wallet.sendCustomTokenEth({
      sender: transactionPayload.from,
      customTokenRecipient,
      contractAddress,
      rawValue
    })
  }

  const onSubmitTransaction = async () => {
    try {
      let totalOriginExpense
      if (transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER) {
        totalOriginExpense = value + totalFee
      } else {
        totalOriginExpense = totalFee
      }

      const senderAddress = get(transactionPayload, 'from')

      const account = await popupAccount.getAccount({ address: senderAddress })
      const balance = await account.get.balance()

      if (balance < totalOriginExpense) {
        setError('Not enough tokens')
        return
      }
    } catch (err) {
      console.error('Balance validate error: ', err.message)
    }

    try {
      const pendingRequest = await storage.generic.get.pendingRequest()
      if (isEmpty(pendingRequest)) throw new Error(ERROR_MESSAGE.REQUEST_NOT_EXIST)

      /* 
        If requestId === undefined, request was sent internally from Finnie
      */
      setIsLoading(true)
      clearInterval(getFeeInterval)
      if (requestId) {
        chrome.runtime.sendMessage({ requestId, approved: true }, function (response) {
          chrome.runtime.onMessage.addListener(function (message) {
            if (message.requestId === requestId) {
              if (message.error) {
                setError(message.error)
              } else {
                window.close()
              }
            }
          })
          storage.generic.set.pendingRequest({})
        })
      } else {
        /* 
          Send request to background
        */
        let result
        if (transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER) {
          result = await handleSendCustomTokenEth()
        } else {
          result = await handleSendEth()
        }

        setIsLoading(false)
        setShowReceipt(true)
        setTxId(result)
        storage.generic.set.pendingRequest({})
      }
    } catch (err) {
      console.error(err.message)
      if (requestId) {
        setError(err.message)
      } else {
        setIsLoading(false)
        setError(err.message)
      }
    }
  }

  const onRejectTransaction = async () => {
    clearInterval(getFeeInterval)
    if (requestId) {
      await storage.generic.set.pendingRequest({})
      window.close()
    } else {
      await storage.generic.set.pendingRequest({})
      setShowSigning(false)
    }
  }

  return { onSubmitTransaction, onRejectTransaction }
}

export default useMethod
