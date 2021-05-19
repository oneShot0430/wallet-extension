export const LOAD_KOI_BY = {
  ADDRESS: 'address',
  KEY: 'key'
}

export const HEADER_EXCLUDE_PATH = ['/account/login']

export const PORTS = {
  POPUP: 'POPUP',
  CONTENT_SCRIPT: 'CONTENT_SCRIPT'
}

export const MESSAGES = {
  IMPORT_WALLET: 'IMPORT_WALLET',
  IMPORT_WALLET_SUCCESS: 'IMPORT_WALLET_SUCCESS',
  LOAD_WALLET: 'LOAD_WALLET',
  LOAD_WALLET_SUCCESS: 'LOAD_WALLET_SUCCESS',
  REMOVE_WALLET: 'REMOVE_WALLET',
  REMOVE_WALLET_SUCCESS: 'REMOVE_WALLET_SUCCESS',
  LOCK_WALLET: 'LOCK_WALLET',
  LOCK_WALLET_SUCCESS: 'LOCK_WALLET_SUCCESS',
  UNLOCK_WALLET: 'UNLOCK_WALLET',
  UNLOCK_WALLET_SUCCESS: 'UNLOCK_WALLET_SUCCESS',
  GENERATE_WALLET: 'GENERATE_WALLET',
  GENERATE_WALLET_SUCCESS: 'GENERATE_WALLET_SUCCESS',
  SAVE_WALLET: 'SAVE_WALLET',
  SAVE_WALLET_SUCCESS: 'SAVE_WALLET_SUCCESS',
  LOAD_CONTENT: 'LOAD_CONTENT',
  LOAD_CONTENT_SUCCESS: 'LOAD_CONTENT_SUCCESS',
  ERROR: 'ERROR',
  GET_ADDRESS: 'GET_ADDRESS',
  GET_ADDRESS_SUCCESS: 'GET_ADDRESS_SUCCESS',
  GET_ADDRESS_ERROR: 'GET_ADDRESS_ERROR',
}

export const PATH = {
  IMPORT_PHRASE_REDIRECT: '/account/import/phrase/success',
  IMPORT_KEY_REDIRECT: '/account/import/keyfile/success',
  HOME: '/account',
  LOGIN: '/account/login',
  NFT_IMAGE: 'https://arweave.net',
  GALLERY: chrome.extension ? `${chrome.extension.getURL('/options.html')}` : 'GALLERY_PATH',
  VIEW_BLOCK: 'https://viewblock.io/arweave/tx'
}

export const ERROR_MESSAGE = {
  INCORRECT_PASSWORD: 'Incorrect password, please try again.',
  PASSWORD_LENGTH: 'Your Koi password must have at least 8 characters.',
  PASSWORD_MATCH: 'Passwords do not match, please try again.',
  INCORRECT_PHRASE: 'Incorrect seed phrase, please try again.',
  EMPTY_PHRASE: 'Seed phrase should not be blank.',
  CHECKED_TERMS: 'You have to agree to the Terms of Service',
  EMPTY_FIELDS: 'Please fill in all fields!'
}

export const STORAGE = {
  KOI_ADDRESS: 'koiAddress',
  KOI_KEY: 'koiKey',
  CONTENT_LIST: 'contentList'
}