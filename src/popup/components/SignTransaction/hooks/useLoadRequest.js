import { useEffect,useState } from 'react'
import { get, isEmpty } from 'lodash'
import { popupAccount } from 'services/account'
import storage from 'services/storage'

import helper from './helper'

const useLoadRequest = ({ setIsLoading }) => {
  const [transactionPayload, setTransactionPayload] = useState(null)
  const [network, setNetwork] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const [favicon, setFavicon] = useState(null)
  const [dataString, setDataString] = useState(null)
  const [transactionType, setTransactionType] = useState(null)
  const [senderName, setSenderName] = useState(null)
  const [recipientName, setRecipientName] = useState(null)
  const [signWithoutSend, setSignWithoutSend] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setIsLoading(true)
        const request = await storage.generic.get.pendingRequest()

        const transactionPayload = get(request, 'data.transactionPayload')
        const network = get(request, 'data.network')
        const origin = get(request, 'data.origin')
        const requestId = get(request, 'data.requestId')
        const favicon = get(request, 'data.favicon')
        const recipientName = get(request, 'data.recipientName')
        const signWithoutSend = get(request, 'data.signWithoutSend')
        const message = get(request, 'data.message')

        let data = get(transactionPayload, 'data')
        if (network === 'ARWEAVE') {
          data = (await storage.generic.get.transactionData()?.data) || '{}'
          data = Object.values(JSON.parse(data)) || []
        }

        let transactionType
        if (network === 'ETHEREUM') {
          transactionType = await helper.getEthereumTransactionType(transactionPayload)
        }
        if (network === 'ARWEAVE') {
          transactionType = await helper.getArweaveTransactionType(transactionPayload)
        }
        if (network === 'SOLANA') {
          transactionType = await helper.getSolanaTransactionType(transactionPayload)
        }
        if (network === 'K2') {
          transactionType = await helper.getK2TransactionType(transactionPayload)
        }

        const sender = get(transactionPayload, 'from')
        const account = await popupAccount.getAccount({ address: sender })
        const senderName = await account.get.accountName()

        setTransactionPayload(transactionPayload)
        setNetwork(network)
        setOrigin(origin)
        setRequestId(requestId)
        setFavicon(favicon)
        setTransactionType(transactionType)
        if (network === 'ARWEAVE') {
          setDataString(data.toString())
        } else {
          setDataString(data)
        }
        setSenderName(senderName)
        setRecipientName(recipientName)
        setSignWithoutSend(signWithoutSend)
        setMessage(message)
      } catch (err) {
        console.error('loadRequest error: ', err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRequest()
  }, [])

  return {
    transactionPayload,
    network,
    origin,
    requestId,
    favicon,
    transactionType,
    dataString,
    senderName,
    recipientName,
    signWithoutSend,
    message
  }
}

export default useLoadRequest
