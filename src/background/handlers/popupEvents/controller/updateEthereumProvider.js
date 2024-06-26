// Services
import helpers from 'background/helpers'
// Constants
import { MESSAGES } from 'constants/koiConstants'
import isEqual from 'lodash/isEqual'
import storage from 'services/storage'

export default async (payload, next) => {
  try {
    const { ethereumProvider, isGalleryRequest } = payload.data
    const currentEthereumProvider = await storage.setting.get.ethereumProvider()

    if (!isEqual(ethereumProvider, currentEthereumProvider)) {
      await storage.setting.set.ethereumProvider(ethereumProvider)

      if (!isGalleryRequest) {
        helpers.sendMessageToPopupPorts({ type: MESSAGES.RELOAD_GALLERY })
      }
    }
    next()
  } catch (err) {
    console.error(err.message)
    next({ error: 'Update Ethereum Provider error' })
  }
}
