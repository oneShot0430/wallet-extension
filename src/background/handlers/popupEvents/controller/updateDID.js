// Services
import { backgroundAccount } from 'services/account'
import helpers from 'background/helpers'

import storage from 'services/storage'

export default async (payload, next) => {
  try {
    const { didData, txId, newkID, activatedAddress } = payload.data

    let address
    if (activatedAddress) address = activatedAddress
    else address = await storage.setting.get.activatedAccountAddress()

    const credentials = await backgroundAccount.getCredentialByAddress(address)
    const account = await backgroundAccount.getAccount(credentials)
    
    let transactionId
    try {
      transactionId = await helpers.did.updateDID(didData, txId, account)
    } catch (err) {
      next({ error: err.message, status: 400 })
      return
    }

    if (newkID) {
      const reactAppId = await helpers.did.getDID(null, txId)
      const kidCreated = await helpers.did.koiiMe.mapKoiiMe({ txId: reactAppId, kID: didData.kID })

      if (!kidCreated) {
        next({ error: 'Map koiime error', status: 400 })
        return
      }
    }

    next({ data: transactionId, status: 200 })
  } catch (err) {
    console.error(err.message)
    next({ error: 'Update DID error', status: 500 })
  }
}