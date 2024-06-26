// import Web3 from 'web3'
import { ethers } from 'ethers'
import { get } from 'lodash'
import storage from 'services/storage'
import { clarifyEthereumProvider } from 'utils'
import decodeTags from 'utils/decodeTags'
import { decodeERC20Transaction } from 'utils/erc20/decodeTxData'

import { TRANSACTION_TYPE } from './constants'

const isContractAddress = async (address) => {
  const provider = await storage.setting.get.ethereumProvider()
  const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)

  const network = ethers.providers.getNetwork(ethNetwork)
  const web3 = new ethers.providers.InfuraProvider(network, apiKey)

  const code = await web3.getCode(address)

  return code !== '0x'
}

const getTransactionType = (network) => async (transactionPayload) => {
  try {
    const value = get(transactionPayload, 'value')
    const to = get(transactionPayload, 'to')
    const data = get(transactionPayload, 'data')
    const tags = decodeTags(get(transactionPayload, 'tags'))

    if (network === 'ETHEREUM') {
      if (!to && !value) return TRANSACTION_TYPE.CONTRACT_DEPLOYMENT

      const isContract = await isContractAddress(to)
      if (!isContract) return TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER

      const decode = decodeERC20Transaction(data)
      if (get(decode, 'name') === 'transfer') {
        return TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER
      }

      return TRANSACTION_TYPE.CONTRACT_INTERACTION
    }

    if (network === 'ARWEAVE') {
      if (!tags) return TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER
      const input = JSON.parse(get(tags, 'Input'))

      if (get(input, 'function') === 'transfer') return TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER
      return TRANSACTION_TYPE.CONTRACT_INTERACTION
    }

    if (network === 'SOLANA') {
      const contractAddress = get(transactionPayload, 'contractAddress')
      if (contractAddress) return TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER
      return TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER
    }

    if (network === 'K2') {
      const contractAddress = get(transactionPayload, 'contractAddress')
      if (contractAddress) return TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER
      return TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER
    }
  } catch (err) {
    console.error('getTransactionType error: ', err.message)
    return TRANSACTION_TYPE.CONTRACT_INTERACTION
  }
}

export default {
  getEthereumTransactionType: getTransactionType('ETHEREUM'),
  getArweaveTransactionType: getTransactionType('ARWEAVE'),
  getSolanaTransactionType: getTransactionType('SOLANA'),
  getK2TransactionType: getTransactionType('K2')
}
