import Web3 from 'web3'
import { get } from 'lodash'
import { v4 as uuid } from 'uuid'

import { backgroundAccount } from 'services/account'
import storage from 'services/storage'

// Constants
import { REQUEST, OS, WINDOW_SIZE } from 'constants/koiConstants'

// Utils
import { createWindow } from 'utils/extension'


export default async (payload, tab, next) => {
  try {
    const params = get(payload, 'data.params')
    const { favicon, origin, hadPermission } = tab

    if (!hadPermission) {
      return next({error: { code: 4100,  data: 'No permissions' }})
    }
    
    const defaultEthereumAddress = await storage.setting.get.activatedEthereumAccountAddress()

    const credential = await backgroundAccount.getCredentialByAddress(defaultEthereumAddress)

    const key = credential.key

    /* Show popup for signing transaction */
    const screenWidth = screen.availWidth
    const screenHeight = screen.availHeight
    const os = window.localStorage.getItem(OS)
    let windowData = {
      url: chrome.extension.getURL('/popup.html'),
      focused: true,
      type: 'popup',
    }
    if (os == 'win') {
      windowData = {
        ...windowData,
        height: WINDOW_SIZE.WIN_HEIGHT,
        width: WINDOW_SIZE.WIN_WIDTH,
        left: Math.round((screenWidth - WINDOW_SIZE.WIN_WIDTH) / 2),
        top: Math.round((screenHeight - WINDOW_SIZE.WIN_HEIGHT) / 2)
      }
    } else {
      windowData = {
        ...windowData,
        height: WINDOW_SIZE.MAC_HEIGHT,
        width: WINDOW_SIZE.MAC_WIDTH,
        left: Math.round((screenWidth - WINDOW_SIZE.MAC_WIDTH) / 2),
        top: Math.round((screenHeight - WINDOW_SIZE.MAC_HEIGHT) / 2)
      }
    }
    
    const requestId = uuid()
    const requestPayload = {
      origin,
      favicon,
      requestId,
      isEthereum: true,
      params,
    }


    createWindow(windowData, {
      beforeCreate: async () => {
        chrome.browserAction.setBadgeText({ text: '1' })
        chrome.runtime.onMessage.addListener(
          async function(popupMessage, sender, sendResponse) {
            if (popupMessage.requestId === requestId) {
              const approved = popupMessage.approved
              if (approved) {
                try {
                  /* Send ETH transaction */
                  const provider = await storage.setting.get.ethereumProvider()

                  const rawTx = params[0]

                  const web3 = new Web3(provider)
                  const estimateGas = await web3.eth.estimateGas(rawTx)
                  rawTx.gas = estimateGas
              
                  const signTx = await web3.eth.accounts.signTransaction(rawTx, key)
                  const receipt = await web3.eth.sendSignedTransaction(signTx.rawTransaction)

                  next({ data: receipt })
                  chrome.runtime.sendMessage({requestId, finished: true})
                } catch (err) {
                  console.error('Send eth error:', err.message)
                  chrome.runtime.sendMessage({requestId, finished: true})
                  next({ error: { code: 4001, data: err.message } })
                } 
              } else {
                next({ error: { code: 4001, data: 'User rejected request' } })
              }
            }
          }
        )

        await storage.generic.set.pendingRequest({
          type: REQUEST.TRANSACTION,
          data: requestPayload
        })
      },
      afterClose: async () => {
        chrome.browserAction.setBadgeText({ text: '' })
        next({ error: 'User cancelled the login.' })
        await storage.generic.set.pendingRequest({})
      }
    })
  } catch (err) {
    next({ error: err.message })
  }
}
