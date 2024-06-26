import { get,isEmpty } from 'lodash'
import storage from 'services/storage'


export default async (_, tab, next) => {
  try {
    const { hadPermission, activatedAddress, origin } = tab

    if (hadPermission) {
      let siteConnectedAddresses = (await storage.setting.get.siteConnectedAddresses())
      if (isEmpty(siteConnectedAddresses[origin])) return next()

      let connectedArweaveAddresses = get(siteConnectedAddresses[origin], 'arweave', [])
      connectedArweaveAddresses = connectedArweaveAddresses.filter(address => address !== activatedAddress)

      siteConnectedAddresses[origin].arweave = connectedArweaveAddresses
      await storage.setting.set.siteConnectedAddresses(siteConnectedAddresses)
    }

    next({ data: { status: 200, data: 'Disconnected.' } })
  } catch (err) {
    console.error(err.message)
    next({ data: { status: 500, data: 'Disconnect error' } })
  }
}
