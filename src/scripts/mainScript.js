/* 
  This script will be injected into client page
*/

const mainScript = () => {
  window.connection = new FinnieRpcConnection()

  window.addEventListener('message', function(event) {
    window.connection.emit(event.data.type + '_' + event.data.id, event.data)
    window.connection.emit(event.data.type, event.data)
  })

  let finnieEthereumProvider, finnieArweaveProvider, finnieSolanaWalletProvider

  if (typeof FinnieEthereumProvider !== 'undefined') {
    finnieEthereumProvider = new FinnieEthereumProvider(window.connection)
  }
  if (typeof FinnieArweaveProvider !== 'undefined') {
    finnieArweaveProvider = new FinnieArweaveProvider(window.connection)
  }
  if (typeof FinnieSolanaProvider !== 'undefined') {
    finnieSolanaWalletProvider = new FinnieSolanaProvider(window.connection)
  }

  const finnieKoiiWalletProvider = new FinnieKoiiWalletProvider(window.connection)
  const finnieK2WalletProvider = new FinnieK2Provider(window.connection)

  if (finnieEthereumProvider) {
    window.addEventListener('chainChanged', function() {
      finnieEthereumProvider.request({ method: 'eth_chainId' }).then(chainId => {
        finnieEthereumProvider.emit('chainChanged', chainId)
      })
      finnieEthereumProvider.emit('chainChanged')
    })
    window.addEventListener('networkChanged', function() {
      finnieEthereumProvider.request({ method: 'net_version' }).then(netVersion => {
        finnieEthereumProvider.emit('networkChanged', netVersion)
      })
    })
    window.addEventListener('accountsChanged', function() {
      finnieEthereumProvider.request({ method: 'eth_accounts' }).then(accounts => {
        finnieEthereumProvider.emit('accountsChanged', accounts)
      })
    })
  }

  if (finnieEthereumProvider) window.ethereum = finnieEthereumProvider
  if (finnieArweaveProvider) window.arweaveWallet = finnieArweaveProvider
  window.koiiWallet = finnieKoiiWalletProvider
  window.koiWallet = finnieKoiiWalletProvider
  if (finnieSolanaWalletProvider) window.solana = finnieSolanaWalletProvider
  window.k2 = finnieK2WalletProvider

  const protectProp = (target, propName) => {
    Object.defineProperty(
      target, 
      propName,
      {...Object.getOwnPropertyDescriptors(target[propName]), writable: false, configurable: false}
    )
  }
  const protectFinnieProvider = (finnieProviderPropName) => {
    if (window[finnieProviderPropName]) protectProp(window, finnieProviderPropName)
  }
  const finnieProviderPropNames = ['ethereum', 'solana', 'k2', 'arweaveWallet', 'koiiWallet', 'koiWallet']
  finnieProviderPropNames.forEach(protectFinnieProvider)
  window.k2.checkAuthentication()
}

// const arweaveWalletExcluded = () => {
//   window.connection = new FinnieRpcConnection()

//   window.addEventListener('message', function(event) {
//     window.connection.emit(event.data.type + '_' + event.data.id, event.data)
//   })

//   const finnieKoiiWalletProvider = new FinnieKoiiWalletProvider(window.connection)

//   window.koiiWallet = finnieKoiiWalletProvider
// }

// export default (disabledArweave) => {
//   if (disabledArweave) return arweaveWalletExcluded
//   else return mainScript
// }

mainScript()
