import '@babel/polyfill'

import { EventHandler } from 'services/request/src/backgroundConnect'
import { contentBackgroundConnect as backgroundConnect } from 'services/request/contentScript'
import { PORTS, MESSAGES, ALLOWED_ORIGIN } from 'constants/koiConstants'
import { setChromeStorage } from 'utils'
import { get, includes } from 'lodash'

import storage from 'services/storage'

if (includes(ALLOWED_ORIGIN, window.origin)) {
  console.log('Finnie is ready to connect to the site.')
}

const messageTypes = [
  MESSAGES.GET_ADDRESS_SUCCESS,
  MESSAGES.GET_ADDRESS_ERROR,
  MESSAGES.GET_PERMISSION_SUCCESS,
  MESSAGES.GET_PERMISSION_ERROR,
  MESSAGES.CREATE_TRANSACTION_SUCCESS,
  MESSAGES.CREATE_TRANSACTION_ERROR,
  MESSAGES.CONNECT_SUCCESS,
  MESSAGES.CONNECT_ERROR,
  MESSAGES.KOI_GET_ADDRESS_SUCCESS,
  MESSAGES.KOI_GET_ADDRESS_ERROR,
  MESSAGES.KOI_GET_PERMISSION_SUCCESS,
  MESSAGES.KOI_GET_PERMISSION_ERROR,
  MESSAGES.KOI_CREATE_TRANSACTION_SUCCESS,
  MESSAGES.KOI_CREATE_TRANSACTION_ERROR,
  MESSAGES.KOI_CONNECT_SUCCESS,
  MESSAGES.KOI_CONNECT_ERROR,
  MESSAGES.KOI_DISCONNECT_SUCCESS,
  MESSAGES.KOI_DISCONNECT_ERROR,
  MESSAGES.KOI_REGISTER_DATA_SUCCESS,
  MESSAGES.KOI_REGISTER_DATA_ERROR,
  MESSAGES.GET_ALL_ADDRESSES_SUCCESS,
  MESSAGES.GET_ALL_ADDRESSES_ERROR,
  MESSAGES.GET_WALLET_NAMES,
  MESSAGES.GET_WALLET_NAMES_SUCCESS,
  MESSAGES.GET_WALLET_NAMES_ERROR,
  MESSAGES.DISCONNECT,
  MESSAGES.DISCONNECT_SUCCESS,
  MESSAGES.DISCONNECT_ERROR,
  MESSAGES.GET_PUBLIC_KEY,
  MESSAGES.GET_PUBLIC_KEY_SUCCESS,
  MESSAGES.GET_PUBLIC_KEY_ERROR,
  MESSAGES.ERROR,
  MESSAGES.KOI_SIGN_PORT_SUCCESS,
  MESSAGES.KOI_SIGN_PORT_ERROR,
  MESSAGES.KOI_SEND_KOI_SUCCESS,
  MESSAGES.KOI_SEND_KOI_ERROR
]

messageTypes.forEach(messageType => {
  backgroundConnect.addHandler(new EventHandler(messageType, (message) => {
    window.postMessage(message)
  }))
})

window.addEventListener('message', async function (event) {
  let transaction, data
  switch (event.data.type) {
    case MESSAGES.GET_ADDRESS:
    case MESSAGES.GET_PERMISSION:
    case MESSAGES.CONNECT:
    case MESSAGES.KOI_GET_ADDRESS:
    case MESSAGES.KOI_GET_PERMISSION:
    case MESSAGES.KOI_CONNECT:
    case MESSAGES.KOI_DISCONNECT:
    case MESSAGES.KOI_REGISTER_DATA:
    case MESSAGES.GET_ALL_ADDRESSES:
    case MESSAGES.GET_WALLET_NAMES:
    case MESSAGES.DISCONNECT:
    case MESSAGES.GET_PUBLIC_KEY:
    case MESSAGES.KOI_SIGN_PORT:
    case MESSAGES.KOI_SEND_KOI:
      backgroundConnect.postMessage(event.data)
      break
    case MESSAGES.KOI_CREATE_TRANSACTION:
    case MESSAGES.CREATE_TRANSACTION:
      /* 
        The Chrome tool doesn't allow sending message with big data.
        Save data of transaction to Chrome storage.
      */
      transaction = get(event, 'data.data.transaction')
      console.log('content-script transaction', transaction)
      data = transaction.data
      await storage.generic.set.transactionData(data)

      event.data.data.transaction.data = []
      backgroundConnect.postMessage(event.data)
      break
    default:
      break
  }
})

; (function (messages) {
  function script() {
    const promiseResolves = {}
    Object.values(MESSAGE_TYPES).forEach(messageType => {
      promiseResolves[`${messageType}_SUCCESS`] = []
      promiseResolves[`${messageType}_ERROR`] = []
    })

    function buildPromise(messageType, data) {
      if (!(window.origin).includes('chrome-extension')) {
        const id = `${messageType}-${Date.now()}`
        const promise = new Promise((resolve, reject) => {
          window.postMessage({ type: messageType, data, id })
          promiseResolves[messageType + '_SUCCESS'].push({ resolve, id })
          promiseResolves[messageType + '_ERROR'].push({ resolve: reject, id })
        })
        return promise
      }
    }

    window.arweaveWallet = {
      getActiveAddress: () => {
        return buildPromise(MESSAGE_TYPES.GET_ADDRESS)
      },
      getAddress: () => {
        return buildPromise(MESSAGE_TYPES.GET_ADDRESS)
      },
      getPermissions: () => {
        return buildPromise(MESSAGE_TYPES.GET_PERMISSION)
      },
      connect: () => buildPromise(MESSAGE_TYPES.CONNECT),
      sign: (transaction) => {
        let plainTransaction = {
          data: JSON.stringify(transaction.data),
          data_root: transaction.data_root,
          tags: transaction.tags,
          quantity: transaction.quantity,
        }
        return buildPromise(MESSAGE_TYPES.CREATE_TRANSACTION, { transaction: plainTransaction })
      },
      getWalletNames: () => buildPromise(MESSAGE_TYPES.GET_WALLET_NAMES),
      getAllAddresses: () => {
        return buildPromise(MESSAGE_TYPES.GET_ALL_ADDRESSES)
      },
      disconnect: () => buildPromise(MESSAGE_TYPES.DISCONNECT),
      getActivePublicKey: () => buildPromise(MESSAGE_TYPES.GET_PUBLIC_KEY),
    }

    window.koii = {
      arweaveWallet: window.arweaveWallet,
      koiiWallet: window.koiWallet
    }

    /* 
      When the user doesn't have permission to: getAddress, sign, registerData, signPort, sendKoii; they will receive:
        { status: 401, data: 'Do not have permissions. }
      (basically they will need to connect to Finnie to perform these actions)
    */
    window.koiiWallet = {
      /**
         * getAddress
         * @returns {Object} { status: 200, data: address }
         * @returns {Object} { status: 404, data: 'Address not found' }
         */
      getAddress: () => buildPromise(MESSAGE_TYPES.KOI_GET_ADDRESS),
        
      /**
         * getPermissions
         * @returns {Object} {status: 200, data: [                  
                    'SIGN_TRANSACTION', 
                    'ACCESS_ADDRESS', 
                    'ACCESS_PUBLIC_KEY',
                    'ACCESS_ALL_ADDRESSES',
                    'ENCRYPT',
                    'DECRYPT',
                    'SIGNATURE',
                    'ACCESS_ARWEAVE_CONFIG']}
          * @returns {Object} {status: 401, data: []}
         */
      getPermissions: () => buildPromise(MESSAGE_TYPES.KOI_GET_PERMISSION),
  
      /**
         * connect
         * @returns {Object} { status: 200, data: 'Connected.' }
         * @returns {Object} { status: 401, data: 'Please import your wallet.'} (This will be returned when Finnie doesn't have any imported wallet)
         * @returns {Object} { status: 401, data: 'Connection rejected' } (When user reject the conecting request, or close Finnie window)
         */
      connect: () => buildPromise(MESSAGE_TYPES.KOI_CONNECT),
  
      /**
         * sign
         * @param {Transaction} transaction 
         * @returns {Object} { status: 200 } (On sign succeeded, the inputted transaction will be sign)
         * @returns {Object} { status: 403, data: 'Transaction rejected.' }
         */
      sign: (transaction) => {
        // create a plainTransaction
        let plainTransaction = {
          data: JSON.stringify(transaction.data),
          data_root: transaction.data_root,
          tags: transaction.tags,
          quantity: transaction.quantity,
          data_size: transaction.data_size
        }
        return buildPromise(MESSAGE_TYPES.KOI_CREATE_TRANSACTION, { transaction: plainTransaction })
          .then((response) => {
            console.log(response)
            const signedTransaction = response.data   
  
            // add signature to the transaction    
            transaction.setSignature({
              id: signedTransaction.id,
              owner: signedTransaction.owner,
              tags: signedTransaction.tags,
              signature: signedTransaction.signature,
            })
            return { status: 200 }
          })
  
      } ,
  
      /**
         * disconnect
         * @returns {Object} { status: 200, data: 'Disconnected.' }
         */
      disconnect: () => buildPromise(MESSAGE_TYPES.KOI_DISCONNECT),
  
      /**
         * registerData
         * @param {String} txId 
         * @returns {Object} { status: 200, data: txId } (transaction ID of register transaction)
         */
      registerData: (txId) => buildPromise(MESSAGE_TYPES.KOI_REGISTER_DATA, { txId }),
  
      /**
         * signPort
         * @param {*} txId 
         * @returns {Object} { status: 200, data: { request-public-key, x-request-signature } }
         */
      signPort: (txId) => buildPromise(MESSAGE_TYPES.KOI_SIGN_PORT, { txId }),
  
      /**
         * sendKoii
         * @param {String} target Recipient address
         * @param {Number} qty 
         * @returns {Object} { status: 200, data: txId } (return the transaction id of the sendKoii transaction)
         */
      sendKoii: (target, qty) => buildPromise(MESSAGE_TYPES.KOI_SEND_KOI, { target, qty })      
    }

    window.koiWallet = window.koiiWallet
  
    window.addEventListener('message', function (event) {
      // console.log('EVENT', event)
      if (!event.data || !event.data.type) {
        return
      }

      if (event.data.type == 'ERROR') {
        const keys = Object.keys(promiseResolves)
        keys.forEach(key => {
          if (key.includes('ERROR') && promiseResolves[key].length > 0 ) {
            promiseResolves[key].forEach(r => {
              const { resolve } = r
              resolve('Something went wrong. Please try to refresh the page.')
            })
          }
          promiseResolves[key].length = 0
        })
      }

      if (promiseResolves[event.data.type]) {
        promiseResolves[event.data.type].forEach(({ id, resolve }) => {
          console.log('Finnie event: ', id)
          resolve(event.data.data)
          if (id === event.data.id) {
            resolve(event.data.data)
          }
        })
        promiseResolves[event.data.type] = promiseResolves[event.data.type].filter(({ id }) => id !== event.data.id)
        const pairMessageType = event.data.type.endsWith('_SUCCESS') ? event.data.type.replace(/_SUCCESS$/g, '_ERROR') : event.data.type.replace(/_ERROR$/g, '_SUCCESS')
        if (pairMessageType !== event.data.type && promiseResolves[pairMessageType]) {
          promiseResolves[pairMessageType] = promiseResolves[pairMessageType].filter(({ id }) => id !== event.data.id)
        }
      }
    })
  }

  function inject(fn) {
    const script = document.createElement('script')
    const arweaveScript = document.createElement('script')
    const {
      GET_ADDRESS,
      GET_PERMISSION,
      CREATE_TRANSACTION,
      CONNECT,
      KOI_GET_ADDRESS,
      KOI_GET_PERMISSION,
      KOI_CREATE_TRANSACTION,
      KOI_CONNECT,
      KOI_DISCONNECT,
      KOI_REGISTER_DATA,
      GET_ALL_ADDRESSES,
      GET_WALLET_NAMES,
      DISCONNECT,
      GET_PUBLIC_KEY,
      KOI_SIGN_PORT,
      KOI_SEND_KOI
      // ENCRYPT
    } = messages
    const pickedMessages = {
      GET_ADDRESS,
      GET_PERMISSION,
      CREATE_TRANSACTION,
      CONNECT,
      KOI_GET_ADDRESS,
      KOI_GET_PERMISSION,
      KOI_CREATE_TRANSACTION,
      KOI_CONNECT,
      KOI_DISCONNECT,
      KOI_REGISTER_DATA,
      GET_ALL_ADDRESSES,
      GET_WALLET_NAMES,
      DISCONNECT,
      GET_PUBLIC_KEY,
      KOI_SIGN_PORT,
      KOI_SEND_KOI
      // ENCRYPT
    }
    script.text = `const MESSAGE_TYPES = JSON.parse('${JSON.stringify(pickedMessages)}');(${fn.toString()})();`
    arweaveScript.src = 'https://unpkg.com/arweave/bundles/web.bundle.js'

    document.documentElement.appendChild(arweaveScript)
    document.documentElement.appendChild(script)
  }

  inject(script)
  const arweaveWalletLoaded = new CustomEvent('arweaveWalletLoaded')
  const finnieWalletLoaded = new CustomEvent('finnieWalletLoaded')
  window.dispatchEvent(arweaveWalletLoaded)
  window.dispatchEvent(finnieWalletLoaded)
})(MESSAGES)
