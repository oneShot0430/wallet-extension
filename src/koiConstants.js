export const LOAD_KOI_BY = {
  ADDRESS: 'address',
  KEY: 'key',
}

export const HEADER_EXCLUDE_PATH = [
  '/account/login',
  '/account/login/phrase',
  '/account/connect-site',
  '/account/sign-transaction',
  '/account/welcome',
  '/account/create/success',
  '/account/import/keyfile/success'
]

export const PORTS = {
  POPUP: 'POPUP',
  CONTENT_SCRIPT: 'CONTENT_SCRIPT',
}

export const MESSAGES = {
  IMPORT_WALLET: 'IMPORT_WALLET',
  IMPORT_WALLET_SUCCESS: 'IMPORT_WALLET_SUCCESS',
  GET_BALANCES: 'GET_BALANCES',
  GET_BALANCES_SUCCESS: 'GET_BALANCES_SUCCESS',
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
  LOAD_ACTIVITIES: 'LOAD_ACTIVITIES',
  LOAD_ACTIVITIES_SUCCESS: 'LOAD_ACTIVITIES_SUCCESS',
  ERROR: 'ERROR',
  MAKE_TRANSFER: 'MAKE_TRANSFER',
  MAKE_TRANSFER_SUCCESS: 'MAKE_TRANSFER_SUCCESS',
  GET_ADDRESS: 'GET_ADDRESS',
  GET_ADDRESS_SUCCESS: 'GET_ADDRESS_SUCCESS',
  GET_ADDRESS_ERROR: 'GET_ADDRESS_ERROR',
  GET_PERMISSION: 'GET_PERMISSION',
  GET_PERMISSION_SUCCESS: 'GET_PERMISSION_SUCCESS',
  GET_PERMISSION_ERROR: 'GET_PERMISSION_ERROR',
  CONNECT: 'CONNECT',
  CONNECT_SUCCESS: 'CONNECT_SUCCESS',
  CONNECT_ERROR: 'CONNECT_ERROR',
  GET_KEY_FILE: 'GET_KEY_FILE',
  GET_KEY_FILE_SUCCESS: 'GET_KEY_FILE_SUCCESS',
  CREATE_TRANSACTION: 'CREATE_TRANSACTION',
  CREATE_TRANSACTION_SUCCESS: 'CREATE_TRANSACTION_SUCCESS',
  CREATE_TRANSACTION_ERROR: 'CREATE_TRANSACTION_ERROR',
  SIGN_TRANSACTION: 'SIGN_TRANSACTION',
  SIGN_TRANSACTION_SUCCESS: 'SIGN_TRANSACTION_SUCCESS',
  SIGN_TRANSACTION_ERROR: 'SIGN_TRANSACTION_ERROR',
  KOI_GET_ADDRESS: 'KOI_GET_ADDRESS',
  KOI_GET_ADDRESS_SUCCESS: 'KOI_GET_ADDRESS_SUCCESS',
  KOI_GET_ADDRESS_ERROR: 'KOI_GET_ADDRESS_ERROR',
  KOI_GET_PERMISSION: 'KOI_GET_PERMISSION',
  KOI_GET_PERMISSION_SUCCESS: 'KOI_GET_PERMISSION_SUCCESS',
  KOI_GET_PERMISSION_ERROR: 'KOI_GET_PERMISSION_ERROR',
  KOI_CREATE_TRANSACTION: 'KOI_CREATE_TRANSACTION',
  KOI_CREATE_TRANSACTION_SUCCESS: 'KOI_CREATE_TRANSACTION_SUCCESS',
  KOI_CREATE_TRANSACTION_ERROR: 'KOI_CREATE_TRANSACTION_ERROR',
  KOI_CONNECT: 'KOI_CONNECT',
  KOI_CONNECT_SUCCESS: 'KOI_CONNECT_SUCCESS',
  KOI_CONNECT_ERROR: 'KOI_CONNECT_ERROR',
  KOI_DISCONNECT: 'KOI_DISCONNECT',
  KOI_DISCONNECT_SUCCESS: 'KOI_DISCONNECT_SUCCESS',
  KOI_DISCONNECT_ERROR: 'KOI_DISCONNECT_ERROR',
  GET_WALLET: 'GET_WALLET',
  GET_WALLET_SUCCESS: 'GET_WALLET_SUCCESS',
  KOI_REGISTER_DATA: 'KOI_REGISTER_DATA',
  KOI_REGISTER_DATA_SUCCESS: 'KOI_REGISTER_DATA_SUCCESS',
  KOI_REGISTER_DATA_ERROR: 'KOI_REGISTERs_DATA_ERROR',
  UPLOAD_NFT: 'UPLOAD_NFT',
  TEST: 'TEST',
  TEST_SUCCESS: 'TEST_SUCCESS'
}

export const PATH = {
  // Router path
  IMPORT_PHRASE_REDIRECT: '/account/import/phrase/success',
  IMPORT_KEY_REDIRECT: '/account/import/keyfile/success',
  CREATE_WALLET_REDIRECT: '/account/create/success',
  HOME: '/account',
  LOGIN: '/account/login',
  // Gallery path
  NFT_IMAGE: 'https://arweave.net',
  VIEW_BLOCK: 'https://viewblock.io/arweave/address',
  KOI_ROCK: 'https://koi.rocks/content-detail',
  GALLERY: chrome.extension
    ? `${chrome.extension.getURL('/options.html')}`
    : 'GALLERY_PATH',
  ALL_CONTENT: 'https://bundler.openkoi.com:8888/state/getTopContentPredicted?frequency=all',
  SINGLE_CONTENT: 'https://bundler.openkoi.com:8888/state/getNFTState?tranxId=',
  VIEW_BLOCK_TRANSACTION: 'https://viewblock.io/arweave/tx',
  CONNECT_SITE: '/account/connect-site',
  // Fetch AR price
  AR_PRICE: 'https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd',
  // Social sharing
  SHARE_TWITTER: 'https://twitter.com/intent/tweet',
  SHARE_FACEBOOK: 'https://www.facebook.com/sharer/sharer.php',
  SHARE_LINKEDIN: 'https://www.linkedin.com/sharing/share-offsite/',
  // Affiliate endpoints
  AFFILIATE_REGISTER: 'https://koi.rocks:8888/api/v1/registerAffiliate',
  AFFILIATE_CLAIM_REWARD: 'https://koi.rocks:8888/api/v1/cliamReward',
  AFFILIATE_REGISTRATION_REWARD: 'https://koi.rocks:8888/api/v1/freeRegistrationReward',
  AFFILIATE_SUBMIT_CODE: 'https://koi.rocks:8888/api/v1/submitCode',
  AFFILIATE_TOTAL_REWARD: 'https://koi.rocks:8888/api/v1/totalRewardForAffiliate'
}

export const ERROR_MESSAGE = {
  INCORRECT_PASSWORD: 'Incorrect password, please try again.',
  PASSWORD_LENGTH: 'Your Koii password must have at least 8 characters.',
  PASSWORD_MATCH: 'Passwords do not match, please try again.',
  INCORRECT_PHRASE: 'Incorrect seed phrase, please try again.',
  EMPTY_PHRASE: 'Seed phrase should not be blank.',
  CHECKED_TERMS: 'You have to agree to the Terms of Service',
  EMPTY_FIELDS: 'Please fill in all fields.',
  NOT_ENOUGH_KOI: `You don't have enough Koii.`,
  REQUEST_NOT_EXIST: 'This request is no longer exist.',
  INVALID_AMOUNT: 'Amount can not be negative.',
  ALREADY_CONNECTED_SITE: 'This site has already connected.',
  MUST_USE_IN_POPUP: 'Please use this feature in the extension pop up.',
  NOT_ENOUGH_AR: `You don't have enough AR.`,
  FILE_TOO_LARGE: 'File too large. The maximum size for NFT is 15MB',
  CANNOT_GET_COSTS: 'Cannot get the upload costs.'
}

export const STORAGE = {
  KOI_ADDRESS: 'koiAddress',
  KOI_KEY: 'koiKey',
  KOI_BALANCE: 'koiBalance',
  AR_BALANCE: 'arBalance',
  CONTENT_LIST: 'contentList',
  ACTIVITIES_LIST: 'activitiesList',
  SITE_PERMISSION: 'sitePermission',
  PENDING_REQUEST: 'pendingRequest',
  KOI_PHRASE: 'koiPhrase',
  PENDING_TRANSACTION: 'pendingTransactions',
  ACCOUNT_NAME: 'accountName',
  PRICE: 'PRICE',
  AFFILIATE_CODE: 'AFFILIATE_CODE',
  SHOW_WELCOME_SCREEN: 'SHOW_WELCOME_SCREEN'
}

export const REQUEST = {
  PERMISSION: 'PERMISSION',
  TRANSACTION: 'TRANSACTION',
}

export const RATE = {
  KOI: 0.93,
  AR: 2,
}

export const NOTIFICATION = {
  COPIED: 'Copied to clipboard.',
  KEY_EXPORTED: 'Private key downloaded.',
  ACCOUNT_NAME_UPDATED: 'Account name updated.',
  NFT_LOADED: 'Your assets list is up to date.',
  TRANSACTION_SENT: 'Transaction sent.'
}

export const WARNING_MESSAGE = {
  SEND_ZERO_KOI: 'You are about to send 0 tokens. There will still be a very small fee. Make sure the transaction is correct before finalizing it.',
}

export const LOAD_BALANCES_TIME_INTERVAL = 10000

export const NFT_BIT_DATA = 'NFT_BIT_DATA'

export const ALL_NFT_LOADED = 'ALL_NFT_LOADED'

export const DISCONNECTED_BACKGROUND = 'Attempting to use a disconnected port object'
