import '@babel/polyfill'
import { includes } from 'lodash'

// constants
import { ALLOWED_ORIGIN, MESSAGES } from 'constants/koiConstants'
import storage from 'services/storage'

import inject from './inject'
import initHanlders from './initHandlers'

import eventEmitterScript from 'content_scripts/scripts/eventEmitterScript'
import finnieEthereumProviderScript from 'content_scripts/scripts/finnieEthereumProviderScript'
import finnieArweaveProviderScript from 'content_scripts/scripts/finnieArweaveProviderScript'
import finnieKoiiWalletProviderScript from 'content_scripts/scripts/finnieKoiiWalletProviderScript'
import finnieRpcConnectionScript from 'content_scripts/scripts/finnieRpcConnectionScript'
import declareConstantScript from 'content_scripts/scripts/declareConstantScript'
import mainScript from 'content_scripts/scripts/mainScript'

if (includes(ALLOWED_ORIGIN, window.origin)) {
  console.log('Finnie is ready to connect to the site.')
}

async function contentScript () {
  await initHanlders()

  const disabledOrigins = await storage.setting.get.disabledOrigins()
  const origin = window.location.origin

  const disabled = disabledOrigins.includes(origin)

  /* 
    Script injection
  */
  const scripts = [
    `(${declareConstantScript})()`,
    `(${eventEmitterScript})()`,
    `(${finnieRpcConnectionScript})()`,
    `(${finnieEthereumProviderScript})()`,
    `(${finnieArweaveProviderScript})()`,
    `(${finnieKoiiWalletProviderScript})()`,
    `(${mainScript(disabled)})();`
  ]

  inject(scripts)

  const arweaveWalletLoaded = new CustomEvent('arweaveWalletLoaded')
  const finnieWalletLoaded = new CustomEvent('finnieWalletLoaded')

  window.dispatchEvent(arweaveWalletLoaded)
  window.dispatchEvent(finnieWalletLoaded)
}

contentScript()
