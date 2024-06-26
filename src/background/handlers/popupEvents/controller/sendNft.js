// Services
import helpers from 'background/helpers'
import { TYPE } from 'constants/accountConstants'
// Constants
import { NETWORK, PENDING_TRANSACTION_TYPE } from 'constants/koiConstants'
import { ethers } from 'ethers'
import { find } from 'lodash'
import get from 'lodash/get'
import { backgroundAccount } from 'services/account'
import storage from 'services/storage'

export default async (payload, next) => {
  const { nftId, senderAddress, recipientAddress } = payload.data
  try {
    const credentials = await backgroundAccount.getCredentialByAddress(senderAddress)
    const account = await backgroundAccount.getAccount(credentials)

    let allAssets = await account.get.assets()
    const nft = find(allAssets, { txId: nftId })

    let txId
    let network
    switch (nft?.type) {
      case TYPE.ARWEAVE:
        txId = await account.method.transferNFT(nftId, recipientAddress)
        break
      case TYPE.SOLANA:
        txId = await account.method.transferNFT(nftId, recipientAddress)
        network = await storage.setting.get.solanaProvider()
        break
      case TYPE.ETHEREUM:
        txId = await account.method.transferNFT(nftId, ethers.utils.getAddress(recipientAddress))
        network = await storage.setting.get.ethereumProvider()
        network = get(network, 'rpcUrl') || network
        break
    }

    if (!txId) {
      next({ error: 'Failed to send nft' })
      return
    }
    const payload = {
      id: txId,
      activityName: 'Sent NFT',
      expense: 0.000001,
      target: recipientAddress,
      address: senderAddress,
      network: network,
      retried: 1,
      transactionType: PENDING_TRANSACTION_TYPE.SEND_NFT,
      contract: nftId
    }
    await helpers.pendingTransactionFactory.createPendingTransaction(payload)

    // update isSending for nft
    allAssets = await account.get.assets()
    allAssets = allAssets.map((asset) => {
      if (asset.txId === nftId) asset.isSending = true
      return asset
    })

    await account.set.assets(allAssets)
    next({ data: txId })
  } catch (err) {
    console.error(err.message)
    next({ error: err.message })
  }
}
