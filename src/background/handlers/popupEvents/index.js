import PopupEvents from './PopupEvents'
import { MESSAGES } from 'constants/koiConstants'

// controllers
import controller from './controller'

const getEmitter = () => {
  const popupEvents = new PopupEvents()

  popupEvents.on(MESSAGES.GET_BALANCES, controller.getBalance)
  popupEvents.on(MESSAGES.IMPORT_WALLET, controller.importWallet)
  popupEvents.on(MESSAGES.REMOVE_WALLET, controller.removeWallet)
  popupEvents.on(MESSAGES.LOCK_WALLET, controller.lockWallet)
  popupEvents.on(MESSAGES.UNLOCK_WALLET, controller.unlockWallet)
  popupEvents.on(MESSAGES.GENERATE_WALLET, controller.generateWallet)
  popupEvents.on(MESSAGES.SAVE_WALLET_GALLERY, controller.saveNewWallet)
  popupEvents.on(MESSAGES.LOAD_CONTENT, controller.loadContent)
  popupEvents.on(MESSAGES.LOAD_ACTIVITIES, controller.loadActivity)
  popupEvents.on(MESSAGES.MAKE_TRANSFER, controller.makeTransfer)
  popupEvents.on(MESSAGES.GET_KEY_FILE, controller.getKeyFile)
  popupEvents.on(MESSAGES.HANDLE_CONNECT, controller.connect)
  popupEvents.on(MESSAGES.HANDLE_SIGN_TRANSACTION, controller.signTransaction)
  popupEvents.on(MESSAGES.UPLOAD_NFT, controller.uploadNft)
  popupEvents.on(MESSAGES.CREATE_COLLECTION, controller.createCollection)
  popupEvents.on(MESSAGES.CREATE_UPDATE_KID, controller.createUpdateDID)
  popupEvents.on(MESSAGES.CHANGE_ACCOUNT_NAME, controller.changeAccountName)
  popupEvents.on(MESSAGES.GET_LOCK_STATE, controller.getLockState)
  popupEvents.on(MESSAGES.LOAD_COLLECTIONS, controller.loadCollection)
  popupEvents.on(MESSAGES.LOAD_KID, controller.loadDID)
  popupEvents.on(MESSAGES.SET_DEFAULT_ACCOUNT, controller.setDefaultAccount)
  popupEvents.on(MESSAGES.FRIEND_REFERRAL, controller.friendReferral)
  popupEvents.on(MESSAGES.TRANSFER_NFT, controller.bridgeNft)
  popupEvents.on(MESSAGES.REAL_TRANSFER_NFT, controller.sendNft)
  popupEvents.on(MESSAGES.HANDLE_EXPIRED_TRANSACTION, controller.handleExpiredTransaction)
  popupEvents.on(MESSAGES.LOAD_FRIEND_REFERRAL_DATA, controller.loadFriendReferralData)
  popupEvents.on(MESSAGES.HANDLE_CREATE_DID, controller.createDID)
  popupEvents.on(MESSAGES.HANDLE_UPDATE_DID, controller.updateDID)
  popupEvents.on(MESSAGES.GET_DID, controller.getDID)

  return popupEvents
}

export default getEmitter()
