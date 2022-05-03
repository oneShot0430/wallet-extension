import { isEmpty, get } from 'lodash'

import storage from 'services/storage'
import { ERROR_MESSAGE } from 'constants/koiConstants'

import { popupBackgroundRequest as request } from 'services/request/popup'

import { fromWeiToEth, fromWinstonToAr } from 'utils'
import { TRANSACTION_TYPE } from './constants'
import { popupAccount } from 'services/account'

const useMethod = ({ 
  setIsLoading, 
  requestId, 
  setError, 
  setShowSigning, 
  transactionPayload, 
  network, 
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

  const handleSendAr = async () => {
    let qty = get(transactionPayload, 'value')
    qty = fromWinstonToAr(parseInt(qty))
    const target = get(transactionPayload, 'to')
    const source = get(transactionPayload, 'from')

    return await request.wallet.makeTransfer({
      qty,
      target,
      address: source,
      token: 'AR'
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

  const handleSendCustomTokenAr = async () => {
    return await request.wallet.sendCustomTokenAr({
      sender: transactionPayload.from,
      customTokenRecipient,
      contractAddress,
      rawValue
    })
  }

  const onSubmitTransaction = async () => {
    // if (!totalFee) {
    //   setError('Transaction fee has not been loaded')
    //   return
    // }

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
        })
        await storage.generic.set.pendingRequest({})
      } else {
        /* 
          Send request to background
        */
        let result
        switch (network) {
          case 'ARWEAVE':
            if (transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER) {
              result = await handleSendCustomTokenAr()
            } else {
              result = await handleSendAr()
            }
            break
          case 'ETHEREUM':
            if (transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER) {
              result = await handleSendCustomTokenEth()
            } else {
              result = await handleSendEth()
            }
            break
        }

        setIsLoading(false)
        setShowReceipt(true)
        setTxId(result)
        storage.generic.set.pendingRequest({})
        // setShowSigning(false)
      }
    } catch (err) {
      console.error(err.message)
      if (requestId) {
        // window.close()
        setError(err.message)
      } else {        
        setIsLoading(false)
        setError(err.message)
      }
    }
  }

  const onRejectTransaction = async () => {
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
