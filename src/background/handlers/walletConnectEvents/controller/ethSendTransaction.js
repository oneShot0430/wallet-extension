import { getInternalError, getSdkError } from '@walletconnect/utils'
import { OS, REQUEST, WINDOW_SIZE } from 'constants/koiConstants'
import { ethers } from 'ethers'
import { get, isEmpty } from 'lodash'
import { backgroundAccount } from 'services/account'
import storage from 'services/storage'
import ethereumUtils from 'utils/ethereumUtils'
import { createWindow } from 'utils/extension'
import { v4 as uuid } from 'uuid'
export default async (payload, next) => {
  try {
    const params = get(payload, 'params')

    /* Show popup for signing transaction */
    const screen = (await chrome.system.display.getInfo())[0].bounds
    const screenWidth = screen.width
    const screenHeight = screen.height
    const os = (await chrome.runtime.getPlatformInfo()).os
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
    const requestPayload = {
      requestId,
      isEthereum: true,
      network: 'ETHEREUM',
      transactionPayload: {
        ...params[0]
      }
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
                next({ error: getInternalError('EXPIRED') })
                chrome.runtime.sendMessage({
                  requestId,
                  error: 'Request has been removed'
                })
                return
              }
              try {
                /* Send ETH transaction */
                const credential = await backgroundAccount.getCredentialByAddress(
                  ethers.utils.getAddress(get(params[0], 'from'))
                )

                const provider = await storage.setting.get.ethereumProvider()

                const { ethersProvider, wallet } = await ethereumUtils.initEthersProvider(
                  provider,
                  credential.key
                )

                const signer = wallet.connect(ethersProvider)
                let transactionPayload = params[0]


                if (transactionPayload.hasOwnProperty('gas')) {
                  delete transactionPayload.gas
                }
                if (transactionPayload.hasOwnProperty('gasPrice')) {
                  delete transactionPayload.gasPrice
                }
                
                const maxPriorityFeePerGas =
                  get(popupMessage, 'maxPriorityFeePerGas') ||
                  ethers.utils.parseUnits('2.5', 'gwei')
                const maxFeePerGas =
                  get(popupMessage, 'maxFeePerGas') ||
                  (await ethereumUtils.calculateMaxFeePerGas(provider, '2.5'))

                const nonce = await ethersProvider.getTransactionCount(
                  ethers.utils.getAddress(get(params[0], 'from')),
                  'pending'
                )

                const gasLimit = await signer.estimateGas(transactionPayload)

                const type = 2 // 0: legacy; 2: eip1559

                const chainId = (await ethersProvider.getNetwork()).chainId

                transactionPayload = {
                  ...transactionPayload,
                  type,
                  maxPriorityFeePerGas,
                  maxFeePerGas,
                  nonce,
                  gasLimit,
                  chainId
                }

                console.log('transactionPayload', transactionPayload)

                const rawTransaction = await signer.signTransaction(transactionPayload)
                const signedTransaction = ethers.utils.parseTransaction(rawTransaction)
                const txHash = get(signedTransaction, 'hash')
                await (await ethersProvider.sendTransaction(rawTransaction)).wait()

                next({ data: txHash })
                chrome.runtime.sendMessage({ requestId, finished: true })
                sendResponse({data: { requestId, finished: true }})
              } catch (err) {
                console.error('Send eth error:', err.message)
                chrome.runtime.sendMessage({ requestId, finished: true })
                sendResponse({data: { requestId, finished: true }})
                next({ error: { code: 4001, message: err.message } })
              }
            } else {
              next({ error: getSdkError('USER_REJECTED_METHODS') })
            }
          }
        })

        await storage.generic.set.pendingRequest({
          type: REQUEST.ETH_TRANSACTION,
          data: requestPayload
        })
      },
      afterClose: async () => {
        chrome.action.setBadgeText({ text: '' })
        next({ error: getSdkError('USER_REJECTED_METHODS') })
        await storage.generic.set.pendingRequest({})
      }
    })
  } catch (err) {
    next({ error: { code: 4001, message: err.message } })
  }
}
