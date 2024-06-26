import MetamaskABI from 'abi/MetamaskABI.json'
import { ethers } from 'ethers'
import isEmpty from 'lodash/isEmpty'
import storage from 'services/storage'
import { clarifyEthereumProvider } from 'utils'

export const isContractAddress = async (address) => {
  const provider = await storage.setting.get.ethereumProvider()
  const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)
  const network = ethers.providers.getNetwork(ethNetwork)
  const web3 = new ethers.providers.InfuraProvider(network, apiKey)

  try {
    const code = await web3.getCode(address)
    return code !== '0x'
  } catch (err) {
    console.log('Failed to get code', code)
    return false
  }
}

export const isInteractWithContract = async (activity) => {
  if (isEmpty(activity.to)) {
    return true
  }
  return await isContractAddress(activity.to)
}

export const decodeTransactionData = async (activityHash) => {
  try {
    const interfaceABI = new ethers.utils.Interface(MetamaskABI)

    const provider = await storage.setting.get.ethereumProvider()
    const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)
    const network = ethers.providers.getNetwork(ethNetwork)
    const web3 = new ethers.providers.InfuraProvider(network, apiKey)

    const transaction = await web3.getTransaction(activityHash)
    const decodedData = interfaceABI.parseTransaction({
      data: transaction.data
    })

    return decodedData
  } catch (error) {
    return undefined
  }
}