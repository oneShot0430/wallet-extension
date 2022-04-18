import React, { useEffect, useState } from 'react'
import { get, isNumber } from 'lodash'

import getTokenData from 'utils/getTokenData'
import getArweaveTokenData from 'utils/getArweaveTokenData'
import { decodeERC20Transaction } from 'utils/erc20/decodeTxData'

import EthereumIcon from 'img/v2/ethereum-logos/ethereum-logo.svg'
import ArweaveIcon from 'img/v2/arweave-logos/arweave-logo.svg'

import { TRANSACTION_TYPE } from './constants'

import decodeTags from 'utils/decodeTags'
import { popupAccount } from 'services/account'

const fromHexToDecimal = (hexString) => {
  let number = null
  if (hexString) number = parseInt(hexString, 16)

  return number
}

const fromWeiToEth = (wei) => {
  return wei / 1000000000000000000
}

/* 
  rawValue is the value in smallest unit
  For example: 1 AR -> rawValue: 1.000.000.000.000 Winston

  value is the value in largest unit
*/
const useSendValue = ({ transactionPayload, network, transactionType, userAddress = '0xb076413401172CBB73C082107514De3376E4FF6c', setIsLoading }) => {
  const [value, setValue] = useState(null)
  const [symbol, setSymbol] = useState(null)
  const [tokenIconPath, setTokenIconPath] = useState(false)
  const [customTokenRecipient, setCustomTokenRecipient] = useState(null)
  const [contractAddress, setContractAddress] = useState(null)
  const [rawValue, setRawValue] = useState(null)
  const [balance, setBalance] = useState(null)
  const [originBalance, setOriginBalance] = useState(null)
  const [originSymbol, setOriginSymbol] = useState(null)

  const getSendValueEthereum = (value) => {
    value = fromHexToDecimal(value)
    value = fromWeiToEth(value)
    return value
  }

  const getSendValueArweave = (value) => {
    value = parseInt(value)
    return value / 1000000000000
  }

  useEffect(() => {
    const loadValue = async () => {
      setIsLoading(true)
      const value = get(transactionPayload, 'value')

      switch (network) {
        case 'ETHEREUM':
          setValue(getSendValueEthereum(value))
          setRawValue(value)
          setSymbol('ETH')
          setOriginSymbol('ETH')
          break
        case 'ARWEAVE':
          setValue(getSendValueArweave(value))
          setRawValue(value)
          setSymbol('AR')
          setOriginSymbol('ETH')
          break
      }

      const account = await popupAccount.getAccount({ address: userAddress })
      const balance = await account.get.balance()

      setOriginBalance(balance)

      if (transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER) {
        if (network === 'ETHEREUM') {
          const to = get(transactionPayload, 'to')
          setContractAddress(to) // "to" is contractAddress for eth transaction
          let {     
            logo,
            balance,
            price,
            name,
            symbol,
            decimal 
          } = await getTokenData(to, userAddress)
  
          const data = get(transactionPayload, 'data')
          const decode = decodeERC20Transaction(data)
          let quantity = get(decode, 'params[1].value')
          const customTokenRecipient = get(decode, 'params[0].value')

          setRawValue(quantity)
  
          decimal = decimal === 1 ? 0 : decimal
          quantity = quantity / (10 ** decimal)
  
          if (!logo) logo = 'img/erc20/generic-token.svg'
  
          setTokenIconPath(logo)
          setSymbol(symbol)
          setValue(quantity)
          setCustomTokenRecipient(customTokenRecipient)
          setBalance(balance / (10 ** decimal))
        }

        if (network === 'ARWEAVE') {
          let tags = decodeTags(get(transactionPayload, 'tags'))
          const contractAddress = get(tags, 'Contract')
          setContractAddress(contractAddress)   
          let {
            logo,
            balance,
            price,
            name,
            symbol,
            decimal
          } = await getArweaveTokenData(contractAddress, userAddress)

          const input = JSON.parse(tags['Input'])

          const customTokenRecipient = get(input, 'target')
          const quantity = get(input, 'qty')

          if (!logo) logo = 'img/erc20/generic-token.svg'

          setTokenIconPath(logo)
          setSymbol(symbol)
          setValue(quantity)
          setRawValue(quantity)
          setCustomTokenRecipient(customTokenRecipient)
          setBalance(balance)
        }
      }

      setIsLoading(false)
    }

    if (transactionPayload && network) loadValue()
  }, [transactionPayload, network, transactionType])

  const SendValue = () => (
    <>
      {isNumber(value) ? value : '------'} {symbol || '------'}
    </>
  )

  const TokenIcon = () => (
    <>
      {network === 'ETHEREUM' && !tokenIconPath && <EthereumIcon />}
      {network === 'ARWEAVE' && !tokenIconPath && <ArweaveIcon />}
      {tokenIconPath && <img src={tokenIconPath}/>}
    </>
  )

  return { SendValue, TokenIcon, customTokenRecipient, value, contractAddress, rawValue, balance, symbol, originBalance, originSymbol }
}

export default useSendValue
