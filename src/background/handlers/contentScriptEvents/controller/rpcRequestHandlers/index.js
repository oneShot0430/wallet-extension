import EventEmitter from 'events'

import ethAccounts from './ethAccounts'
import ethBlockNumber from './ethBlockNumber'
import ethCall from './ethCall'
import ethChainId from './ethChainId'
import ethDecrypt from './ethDecrypt'
import ethEstimateGas from './ethEstimateGas'
import ethGetBlockByNumber from './ethGetBlockByNumber'
import ethGetEncryptionPublicKey from './ethGetEncryptionPublicKey'
import ethGetTransactionByHash from './ethGetTransactionByHash'
import ethGetTransactionReceipt from './ethGetTransactionReceipt'
import ethRequestAccounts from './ethRequestAccounts'
import ethSendTransaction from './ethSendTransaction'
import ethSign from './ethSign'
import ethSignTypedData from './ethSignTypedData'
import ethSignTypedDataV3 from './ethSignTypedDataV3'
import ethSignTypedDataV4 from './ethSignTypedDataV4'
import netVersion from './netVersion'
import personalEcRecover from './personalEcRecover'
import personalSign from './personalSign'
import walletGetPermissions from './walletGetPermissions'
import walletRequestPermissions from './walletRequestPermissions'

const METHOD = {
  eth_requestAccounts: 'eth_requestAccounts', // connect -> popup
  wallet_requestPermissions: 'wallet_requestPermissions', // request permissions -> popup
  wallet_getPermissions: 'wallet_getPermissions', // get permisisons
  eth_accounts: 'eth_accounts', // get all eth accounts
  eth_getEncryptionPublicKey: 'eth_getEncryptionPublicKey', // param: ['addresses'] get encryption public key -> popup (use this key to encrypt message)
  eth_decrypt: 'eth_decrypt', // params: ['encryptionData', 'selectedAddress'] decrypt message -> popup
  eth_chainId: 'eth_chainId', // get chainId
  net_version: 'net_version', // get networkId
  eth_sendTransaction: 'eth_sendTransaction', // send eth
  eth_sign: 'eth_sign',
  eth_signTypedData: 'eth_signTypedData',
  eth_signTypedData_v3: 'eth_signTypedData_v3',
  eth_signTypedData_v4: 'eth_signTypedData_v4',
  personal_sign: 'personal_sign',
  personal_ecRecover: 'personal_ecRecover',
  eth_estimateGas: 'eth_estimateGas',
  eth_getTransactionByHash: 'eth_getTransactionByHash',
  eth_blockNumber: 'eth_blockNumber',
  eth_getTransactionReceipt: 'eth_getTransactionReceipt',
  eth_getBlockByNumber: 'eth_getBlockByNumber',
  eth_call: 'eth_call'
}

class EthereumRequestHandlers extends EventEmitter {
  constructor() {
    super()
  }

  send(method, payload, tab, next) {
    this.emit(method, payload, tab, next)
  }
}

const getEthereumRequestHandlers = () => {
  const ethereumRequestHandlers = new EthereumRequestHandlers()

  ethereumRequestHandlers.on(METHOD.eth_requestAccounts, ethRequestAccounts)
  ethereumRequestHandlers.on(METHOD.wallet_requestPermissions, walletRequestPermissions)
  ethereumRequestHandlers.on(METHOD.wallet_getPermissions, walletGetPermissions)
  ethereumRequestHandlers.on(METHOD.eth_accounts, ethAccounts)
  ethereumRequestHandlers.on(METHOD.eth_getEncryptionPublicKey, ethGetEncryptionPublicKey)
  ethereumRequestHandlers.on(METHOD.eth_decrypt, ethDecrypt)
  ethereumRequestHandlers.on(METHOD.net_version, netVersion)
  ethereumRequestHandlers.on(METHOD.eth_sendTransaction, ethSendTransaction)
  ethereumRequestHandlers.on(METHOD.eth_chainId, ethChainId)
  ethereumRequestHandlers.on(METHOD.eth_sign, ethSign)
  ethereumRequestHandlers.on(METHOD.eth_signTypedData, ethSignTypedData)
  ethereumRequestHandlers.on(METHOD.eth_signTypedData_v3, ethSignTypedDataV3)
  ethereumRequestHandlers.on(METHOD.eth_signTypedData_v4, ethSignTypedDataV4)
  ethereumRequestHandlers.on(METHOD.personal_sign, personalSign)
  ethereumRequestHandlers.on(METHOD.personal_ecRecover, personalEcRecover)
  ethereumRequestHandlers.on(METHOD.eth_estimateGas, ethEstimateGas)
  ethereumRequestHandlers.on(METHOD.eth_getTransactionByHash, ethGetTransactionByHash)
  ethereumRequestHandlers.on(METHOD.eth_blockNumber, ethBlockNumber)
  ethereumRequestHandlers.on(METHOD.eth_getTransactionReceipt, ethGetTransactionReceipt)
  ethereumRequestHandlers.on(METHOD.eth_getBlockByNumber, ethGetBlockByNumber)
  ethereumRequestHandlers.on(METHOD.eth_call, ethCall)

  return ethereumRequestHandlers
}

export default getEthereumRequestHandlers()
