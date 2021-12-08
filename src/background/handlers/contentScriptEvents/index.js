import ContentScriptEvents from './ContentScriptEvents'
import { MESSAGES } from 'constants/koiConstants'

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
  contentScriptEvents.on(MESSAGES.CREATE_TRANSACTION, controller.createTransaction)
  contentScriptEvents.on(MESSAGES.KOI_CREATE_TRANSACTION, controller.koiCreateTransaction)
  contentScriptEvents.on(MESSAGES.DISCONNECT, controller.disconnect)
  contentScriptEvents.on(MESSAGES.KOI_DISCONNECT, controller.koiDisconnect)
  contentScriptEvents.on(MESSAGES.GET_WALLET_NAMES, controller.getWalletName)
  contentScriptEvents.on(MESSAGES.KOI_REGISTER_DATA, controller.koiRegisterData)
  contentScriptEvents.on(MESSAGES.GET_PUBLIC_KEY, controller.getPublicKey)
  contentScriptEvents.on(MESSAGES.KOI_SIGN_PORT, controller.koiSignPort)
  contentScriptEvents.on(MESSAGES.KOI_SEND_KOI, controller.koiSendKoi)
  contentScriptEvents.on(MESSAGES.CREATE_DID, controller.createDID)

  return contentScriptEvents
}

export default getEmitter()
