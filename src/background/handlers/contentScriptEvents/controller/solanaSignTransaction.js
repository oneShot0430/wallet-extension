import { decodeTransferInstructionUnchecked, getAccount } from '@solana/spl-token'
import { Message, Transaction } from '@solana/web3.js'
import { Connection, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import base58 from 'bs58'
import bs58 from 'bs58'
// Constants
import { OS, REQUEST, WINDOW_SIZE } from 'constants/koiConstants'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { backgroundAccount } from 'services/account'
import { SolanaTool } from 'services/solana'
import storage from 'services/storage'
import clusterApiUrl from 'utils/clusterApiUrl'
// Utils
import { createWindow } from 'utils/extension'
import { v4 as uuid } from 'uuid'

const getTransactionDataFromMessage = async (transactionMessage) => {
  try {
    const message = Message.from(bs58.decode(transactionMessage))

    const transaction = Transaction.populate(message)
    const instruction = transaction.instructions[0]

    const decodeData = decodeTransferInstructionUnchecked(instruction)

    if (decodeData.data.instruction === 3) {
      const provider = await storage.setting.get.solanaProvider()
      const connection = new Connection(clusterApiUrl(provider), 'confirmed')

      const contractData = await getAccount(
        connection,
        new PublicKey(decodeData.keys.source.pubkey)
      )
      const contractAddress = contractData.mint.toString()

      const recipientAccount = await getAccount(
        connection,
        new PublicKey(decodeData.keys.destination.pubkey)
      )

      return {
        from: decodeData.keys.owner.pubkey.toString(),
        to: recipientAccount.owner.toString(),
        value: Number(decodeData.data.amount),
        contractAddress
      }
    } else {
      return {
        from: decodeData.keys.source.pubkey.toString(),
        to: decodeData.keys.destination.pubkey.toString(),
        value: Number(decodeData.data.amount) / 16777216
      }
    }
  } catch (err) {
    console.error(err)
  }
}

export default async (payload, tab, next) => {
  try {
    const { favicon, origin, hadPermission, hasPendingRequest, connectedAddresses } = tab

    if (!hadPermission) {
      return next({ error: { code: 4100, data: 'No permissions' } })
    }

    const encodedMessage = get(payload, 'data')
    if (hasPendingRequest) {
      next({ error: { code: 4001, data: 'Request pending' } })
      return
    }

    /* Show popup for signing transaction */
    // Avoid error when os getPlatformInfo and display is undefined
    let screen, os
    try {
      os = (await chrome.runtime.getPlatformInfo()).os
    } catch (error) {
      os = 'mac'
    }

    try {
      screen = (await chrome.system.display.getInfo())[0].bounds
    } catch (error) {
      screen = { width: 100, height: 100 }
    }

    const screenWidth = screen.width
    const screenHeight = screen.height

    let windowData = {
      url: chrome.runtime.getURL('/popup.html'),
      focused: true,
      type: 'popup'
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

    const transactionPayload = await getTransactionDataFromMessage(payload.data)
    const requestPayload = {
      origin,
      favicon,
      requestId,
      network: 'SOLANA',
      transactionPayload,
      signWithoutSend: true
    }

    createWindow(windowData, {
      beforeCreate: async () => {
        chrome.action.setBadgeText({ text: '1' })
        chrome.runtime.onMessage.addListener(async function (popupMessage, sender, sendResponse) {
          if (popupMessage.requestId === requestId) {
            const approved = popupMessage.approved
            if (approved) {
              var pendingRequest = await storage.generic.get.pendingRequest()
              if (isEmpty(pendingRequest)) {
                next({ error: { code: 4001, data: 'Request has been removed' } })
                chrome.runtime.sendMessage({
                  requestId,
                  error: 'Request has been removed'
                })
                return
              }
              try {
                /* Sign transaction */
                const encodedMessage = get(payload, 'data')

                const credentials = await backgroundAccount.getCredentialByAddress(
                  connectedAddresses[0]
                )
                const solTool = new SolanaTool(credentials)
                const keypair = solTool.keypair

                const transactionMessage = Message.from(base58.decode(encodedMessage))
                const transaction = Transaction.populate(transactionMessage)

                transaction.sign(keypair)

                const encodedSignedTransaction = base58.encode(transaction.serialize())

                next({ data: encodedSignedTransaction })
                chrome.runtime.sendMessage({ requestId, finished: true })
                sendResponse({data: { requestId, finished: true }})
              } catch (err) {
                console.error('Send sol error:', err.message)
                chrome.runtime.sendMessage({ requestId, finished: true })
                sendResponse({data: { requestId, finished: true }})
                next({ error: { code: 4001, data: err.message } })
              }
            } else {
              next({ error: { code: 4001, data: 'Request rejected' } })
            }
          }
        })

        await storage.generic.set.pendingRequest({
          type: REQUEST.TRANSACTION,
          data: requestPayload
        })
      },
      afterClose: async () => {
        chrome.action.setBadgeText({ text: '' })
        next({ error: { code: 4001, data: 'Request rejected' } })
        await storage.generic.set.pendingRequest({})
      }
    })
  } catch (err) {
    next({ error: err.message })
  }
}
