import { MESSAGES } from 'constants/koiConstants'

import ContentScriptEvents from './ContentScriptEvents'
// controller
import controller from './controller'

const getEmitter = () => {
  const contentScriptEvents = new ContentScriptEvents()

  contentScriptEvents.on(MESSAGES.KOI_CONNECT, controller.koiConnect)
  contentScriptEvents.on(MESSAGES.CONNECT, controller.connect)
  contentScriptEvents.on(MESSAGES.GET_ADDRESS, controller.getAddress)
  contentScriptEvents.on(MESSAGES.KOI_GET_ADDRESS, controller.koiGetAddress)
  contentScriptEvents.on(MESSAGES.GET_ALL_ADDRESSES, controller.getAllAddresses)
  contentScriptEvents.on(MESSAGES.GET_PERMISSION, controller.getPermission)
  contentScriptEvents.on(MESSAGES.KOI_GET_PERMISSION, controller.koiGetPermission)
  contentScriptEvents.on(MESSAGES.CREATE_TRANSACTION, controller.signArweaveTransaction)
  contentScriptEvents.on(MESSAGES.KOI_CREATE_TRANSACTION, controller.signArweaveTransaction)
  contentScriptEvents.on(MESSAGES.DISCONNECT, controller.disconnect)
  contentScriptEvents.on(MESSAGES.KOI_DISCONNECT, controller.koiDisconnect)
  contentScriptEvents.on(MESSAGES.GET_WALLET_NAMES, controller.getWalletName)
  contentScriptEvents.on(MESSAGES.KOI_REGISTER_DATA, controller.koiRegisterData)
  contentScriptEvents.on(MESSAGES.GET_PUBLIC_KEY, controller.getPublicKey)
  contentScriptEvents.on(MESSAGES.KOI_SIGN_PORT, controller.koiSignPort)
  contentScriptEvents.on(MESSAGES.KOI_SEND_KOI, controller.koiSendKoi)
  contentScriptEvents.on(MESSAGES.KOI_CREATE_DID, controller.createDID)
  contentScriptEvents.on(MESSAGES.KOI_UPDATE_DID, controller.updateDID)
  contentScriptEvents.on(MESSAGES.SIGNATURE, controller.signature)
  contentScriptEvents.on(MESSAGES.ETHEREUM_RPC_REQUEST, controller.ethereumRpcRequest)
  contentScriptEvents.on(MESSAGES.TEST_ETHEREUM, controller.testEthereum)
  contentScriptEvents.on(MESSAGES.SOLANA_CHECK_CONNECTION, controller.solanaCheckConnection)
  contentScriptEvents.on(MESSAGES.SOLANA_CONNECT, controller.solanaConnect)
  contentScriptEvents.on(MESSAGES.SOLANA_DISCONNECT, controller.solanaDisconnect)
  contentScriptEvents.on(MESSAGES.SOLANA_SIGN_ALL_TRANSACTIONS, controller.solanaSignAllTransactions)
  contentScriptEvents.on(MESSAGES.SOLANA_SIGN_TRANSACTION, controller.solanaSignTransaction)
  contentScriptEvents.on(MESSAGES.SOLANA_SIGN_MESSAGE, controller.solanaSignMessage)
  contentScriptEvents.on(MESSAGES.SOLANA_SIGN_AND_SEND_TRANSACTION, controller.solanaSignAndSendTransaction)
  contentScriptEvents.on(MESSAGES.K2_CONNECT, controller.k2Connect)
  contentScriptEvents.on(MESSAGES.K2_DISCONNECT, controller.k2Disconnect)
  contentScriptEvents.on(MESSAGES.K2_SIGN_AND_SEND_TRANSACTION, controller.k2SignAndSendTransaction)
  contentScriptEvents.on(MESSAGES.K2_SIGN_MESSAGE, controller.k2SignMessage)
  contentScriptEvents.on(MESSAGES.K2_SIGN_TRANSACTION, controller.k2SignTransaction)
  contentScriptEvents.on(MESSAGES.K2_CHECK_AUTHENTICATION, controller.k2CheckAuthentication)

  return contentScriptEvents
}

export default getEmitter()
