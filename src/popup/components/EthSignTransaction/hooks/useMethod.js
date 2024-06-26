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
  setShowReceipt,
  maxFeePerGas,
  maxPriorityFeePerGas,
  maxFee,
  balance
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
      token: 'ETH',
      maxPriorityFeePerGas,
      maxFeePerGas
    })
  }

  const handleSendCustomTokenEth = async () => {
    return await request.wallet.sendCustomTokenEth({
      sender: transactionPayload.from,
      customTokenRecipient,
      contractAddress,
      rawValue,
      maxPriorityFeePerGas,
      maxFeePerGas
    })
  }

  const onSubmitTransaction = async () => {
    try {
      let totalOriginTokenExpense
      if (transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER) {
        totalOriginTokenExpense = value + maxFee
      } else {
        totalOriginTokenExpense = maxFee
      }

      const senderAddress = get(transactionPayload, 'from')

      const account = await popupAccount.getAccount({ address: senderAddress })
      const accountBalance = await account.get.balance()
      if (accountBalance < totalOriginTokenExpense) {
        setError(chrome.i18n.getMessage('notEnoughTokens'))
        return
      }

      if (transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER) {
        if (balance < value) {
          setError(chrome.i18n.getMessage('notEnoughTokens'))
          return
        }
      }
    } catch (err) {
      console.error('Balance validate error: ', err.message)
    }

    try {
      const pendingRequest = await storage.generic.get.pendingRequest()
      if (isEmpty(pendingRequest)) throw new Error(chrome.i18n.getMessage('requestNotExist'))

      /* 
        If requestId === undefined, request was sent internally from Finnie
      */
      setIsLoading(true)
      if (requestId) {
        const message = {
          requestId,
          approved: true,
          maxPriorityFeePerGas,
          maxFeePerGas
        }
        chrome.runtime.sendMessage(message, function (response) {
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
