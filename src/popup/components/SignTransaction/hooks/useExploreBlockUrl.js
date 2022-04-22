import { useEffect, useState } from 'react'
import { get } from 'lodash'

import { isArweaveAddress, isEthereumAddress } from 'utils'
import storage from 'services/storage'
import { ETH_NETWORK_PROVIDER } from 'constants/koiConstants'

const useExploreBlock = ({ transactionPayload }) => {
  const [exploreBlockUrl, setExploreBlockUrl] = useState('')

  useEffect(() => {
    const load = async () => {
      const sender = get(transactionPayload, 'from')
      if (isArweaveAddress(sender)) {
        return setExploreBlockUrl('http://viewblock.io/arweave/tx')
      }

      if (isEthereumAddress(sender)) {
        const provider = await storage.setting.get.ethereumProvider()
        if (provider === ETH_NETWORK_PROVIDER.MAINNET) {
          return setExploreBlockUrl('https://etherscan.io/tx')
        }
        if (provider === ETH_NETWORK_PROVIDER.RINKEBY) {
          return setExploreBlockUrl('https://rinkeby.etherscan.io/tx')
        }
      }
    }

    if (transactionPayload) load()
  }, [transactionPayload])

  return { exploreBlockUrl }
}

export default useExploreBlock