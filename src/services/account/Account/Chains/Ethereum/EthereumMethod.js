/* 
  Arweave method is functions to use when we have address and key of a wallet.
  Load activities, assets,...
*/

import HDWalletProvider from '@truffle/hdwallet-provider'
import axiosAdapter from '@vespaiach/axios-fetch-adapter'
import axios from 'axios'
import { ACCOUNT } from 'constants/accountConstants'
import { TYPE } from 'constants/accountConstants'
import {
  ACTIVITY_NAME,
  ALL_NFT_LOADED,
  ETH_NFT_BRIDGE_ACTION,
  ETHERSCAN_API,
  PATH,
  TRANSACTION_METHOD
} from 'constants/koiConstants'
import {
  BRIDGE_FLOW,
  ETH_NETWORK_PROVIDER,
  KOI_ROUTER_CONTRACT,
  URL,
  VALID_TOKEN_SCHEMA
} from 'constants/koiConstants'
import { BigNumber, ethers } from 'ethers'
import { find, findIndex, get, includes, isEmpty } from 'lodash'
import moment from 'moment'
import { AccountStorageUtils } from 'services/account/AccountStorageUtils'
import { getEthereumNetworkProvider } from 'services/getNetworkProvider'
import storage from 'services/storage'
import { getChromeStorage, removeWalletFromChrome } from 'utils'
import { clarifyEthereumProvider } from 'utils'
import * as ethereumAssets from 'utils/ethereumActivities'
import ethereumUtils from 'utils/ethereumUtils'

// import Web3 from 'web3'
import ERC20ABI from './abi/ERC20ABI.json'
import ERC721ABI from './abi/ERC721ABI.json'
import ERC1155ABI from './abi/ERC1155ABI.json'
import koiRouterABI from './abi/KoiRouter.json'
import koiTokenABI from './abi/KoiToken.json'

export class EthereumMethod {
  #chrome
  constructor(eth) {
    this.eth = eth
    this.#chrome = new AccountStorageUtils(eth.address)
  }

  async getWallet() {
    const rpcUrl = await storage.setting.get.ethereumProvider()
    const etherProvider = await getEthereumNetworkProvider(rpcUrl)
    const wallet = new ethers.Wallet(this.eth.key, etherProvider)

    return wallet
  }

  async getBalances() {
    const wallet = await this.getWallet()
    const balance = ethers.utils.formatEther(await wallet.getBalance())
    const koiBalance = 0
    return { balance, koiBalance }
  }

  async loadMyContent() {
    try {
      const ethereumProvider = await storage.setting.get.ethereumProvider()

      let path
      switch (ethereumProvider) {
        case 'https://mainnet.infura.io/v3/f811f2257c4a4cceba5ab9044a1f03d2':
          path = PATH.OPENSEA_API_MAINNET
          break
        case 'https://goerli.infura.io/v3/f811f2257c4a4cceba5ab9044a1f03d2':
          path = PATH.OPENSEA_API_RINEKY
          break
        default:
          path = null
      }

      /* 
        get nft list for this ETH address
      */
      let ethAssets = []

      if (path) {
        for (let i = 0; i < 3; i++) {
          let assets = []
          const url = `${path}/assets?owner=${this.eth.address}&order_direction=desc&offset=${
            i * 50
          }&limit=50`
          try {
            let headers = {}
            if (ethereumProvider.includes('mainnet')) {
              headers = { 'X-API-KEY': 'b2c5ef456a464bda8868fd20d8af6ce2' }
            }

            const { data } = await axios.request({
              url,
              headers,
              method: 'GET',
              adapter: axiosAdapter
            })
            assets = get(data, 'assets') || []
          } catch (err) {
            console.error('Fetched ETH nft error: ', err.message)
          }

          ethAssets = [...ethAssets, ...assets]
        }
      }

      console.log('Fetched contents: ', ethAssets.length)

      /* 
        get nft list for this ETH address from Chrome storage
      */
      const contentList =
        (await getChromeStorage(`${this.eth.address}_assets`))[`${this.eth.address}_assets`] || []
      console.log('Saved contents: ', contentList.length)

      /*
        There're two cases that NFTs will be filtered:
        - Failed load content (removed on functions cacheNFTs on "background/popupEventHandlers")
        - Out-of-date NFTs
      */
      const ethAssetIds = ethAssets.map(
        (ethAsset) => `${ethAsset.token_id}_${ethAsset.asset_contract?.address}`
      )

      const validContents = contentList.filter((content) => {
        return ethAssetIds.indexOf(content.txId) !== -1
      })
      console.log('Up to date saved content: ', validContents.length)

      /* 
        detect new nft(s) that were not saved in Chrome storage
      */
      const storageContentIds = validContents.map((nft) => nft.txId)

      const newContents = ethAssets.filter((ethAsset) => {
        return (
          storageContentIds.indexOf(`${ethAsset.token_id}_${ethAsset.asset_contract?.address}`) ===
          -1
        )
      })

      console.log('New contents: ', newContents.length)

      if (!newContents.length && ethAssets.length === contentList.length) {
        console.log('ALL NFT LOADED')
        return ALL_NFT_LOADED
      }

      const newContentList = await this.getNftData(newContents, false)

      const res = {
        contents: [...validContents, ...newContentList],
        newContents
      }
      return res
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async updateActivities() {
    let etherscanNetwork, network, token

    network = this.eth.getCurrentNetWork()

    switch (network) {
      case ETH_NETWORK_PROVIDER.GOERLI:
        etherscanNetwork = 'goerli'
        token = 'ETH'
        break
      case ETH_NETWORK_PROVIDER.MAINNET:
        etherscanNetwork = 'homestead'
        token = 'ETH'
        break
      case ETH_NETWORK_PROVIDER.POLYGON:
        etherscanNetwork = 'matic'
        token = 'MATIC'
        break
      case ETH_NETWORK_PROVIDER.POLYGON_MUMBAI:
        etherscanNetwork = 'maticmum'
        token = 'MATIC'
        break
      default:
        etherscanNetwork = null
    }

    const walletAddress = this.eth.address
    const etherscanAPIKey = 'USBA7QPN747A6KGYFCSY42KZ1W9JGFI2YB'
    const etherscanProvider = new ethers.providers.EtherscanProvider(
      etherscanNetwork,
      etherscanAPIKey
    )

    let fetchedData = []
    if (etherscanNetwork) {
      fetchedData = await etherscanProvider.getHistory(walletAddress)
      fetchedData = fetchedData.reverse() // Descending transactions
    }

    const accountName = await this.#chrome.getField(ACCOUNT.ACCOUNT_NAME)

    const rpcUrl = await storage.setting.get.ethereumProvider()
    const web3 = await getEthereumNetworkProvider(rpcUrl)

    fetchedData = await Promise.all(
      fetchedData.map(async (activity) => {
        try {
          let id = activity.hash,
            activityName,
            expense,
            date,
            source,
            time,
            gasFee
          try {
            const isSender = activity.from.toLowerCase() === this.eth.address.toLowerCase()

            if (await ethereumAssets.isInteractWithContract(activity)) {
              // Activity with contract
              const decodedData = await ethereumAssets.decodeTransactionData(id)
              if (!isEmpty(decodedData)) {
                // Supported activities
                let token, decimals, contract, to
                const transactionMethod = get(decodedData, 'name')
                let receipt
                switch (transactionMethod) {
                  case TRANSACTION_METHOD.ERC20_TRANSFER:
                    contract = new ethers.Contract(activity.to, ERC20ABI, web3)
                    token = await contract.symbol()
                    decimals = await contract.decimals()

                    to = get(decodedData, 'args')[0]
                    expense = Number(get(decodedData, 'args')[1])

                    if (isSender) {
                      activityName = `${chrome.i18n.getMessage('sent')} ${token}`
                      source = to
                      expense = expense / Math.pow(10, decimals)
                    } else {
                      activityName = `${chrome.i18n.getMessage('received')} ${token}`
                      source = activity.from
                      expense = expense / Math.pow(10, decimals)
                    }
                    break
                  case TRANSACTION_METHOD.ERC1155_TRANSFER:
                  case TRANSACTION_METHOD.ERC721_TRANSFER:
                  case TRANSACTION_METHOD.ERC721_TRANSFER_FROM:
                  case TRANSACTION_METHOD.SET_APPROVAL_FOR_ALL:
                  case TRANSACTION_METHOD.APPROVE:
                  case TRANSACTION_METHOD.MINT_COLLECTIBLES:
                  default:
                    activityName = chrome.i18n.getMessage('contractInteraction')
                    source = activity.to
                    receipt = await web3.getTransactionReceipt(id)
                    gasFee =
                      (Number(receipt.gasUsed) * Number(activity.gasPrice)) / Math.pow(10, 18)
                    expense = gasFee + activity.value / Math.pow(10, 18)
                    break
                }
              } else {
                // Not-supported activities
                activityName = chrome.i18n.getMessage('contractInteraction')
                source = activity.to
                const receipt = await web3.getTransactionReceipt(id)
                gasFee = (Number(receipt.gasUsed) * Number(activity.gasPrice)) / Math.pow(10, 18)
                expense = gasFee + activity.value / Math.pow(10, 18)
              }
            } else {
              // Normal transfer ETH
              if (isSender) {
                // Transfer ETH
                activityName = `${chrome.i18n.getMessage('sent')} ${token}`
                source = activity.to
                const receipt = await web3.getTransactionReceipt(id)
                gasFee = (Number(receipt.gasUsed) * Number(activity.gasPrice)) / Math.pow(10, 18)
                expense = gasFee + activity.value / Math.pow(10, 18)
              } else {
                // Receive ETH
                activityName = `${chrome.i18n.getMessage('received')} ${token}`
                source = activity.from
                expense = activity.value / Math.pow(10, 18)
              }
            }
            date = moment(Number(activity.timestamp) * 1000).format('MMMM DD YYYY')

            time = activity.timestamp
          } catch (error) {
            // UNKNOWN TRANSACTION
            console.error('Get transaction failed: ', error)
            activityName = chrome.i18n.getMessage('unknownTransaction')
            source = activity?.to
            expense = activity?.value / Math.pow(10, 18)
          }

          return {
            id,
            activityName,
            expense,
            accountName,
            date,
            source,
            time,
            network,
            address: this.eth.address,
            isEthAccount: true
          }
        } catch (err) {
          console.error(err.message)
          return {}
        }
      })
    )

    const oldActivites = (await this.#chrome.getActivities()) || []
    const newestOfOldActivites = oldActivites[0]

    if (newestOfOldActivites) {
      const idx = findIndex(fetchedData, (data) => data.id === newestOfOldActivites.id)

      for (let i = 0; i < idx; i++) {
        fetchedData[i].seen = false
      }
    } else {
      for (let i = 0; i < fetchedData.length; i++) {
        fetchedData[i].seen = false
      }
    }

    await this.#chrome.setActivities(fetchedData)
  }

  async transfer(_, recipient, qty, maxPriorityFeePerGas, maxFeePerGas) {
    try {
      // Initialize provider and wallet
      const providerUrl = await storage.setting.get.ethereumProvider()
      const { ethersProvider, wallet } = await ethereumUtils.initEthersProvider(
        providerUrl,
        this.eth.key
      )
      const signer = wallet.connect(ethersProvider)

      // Gas
      maxPriorityFeePerGas = maxPriorityFeePerGas || 2.5 * Math.pow(10, 9)
      const priortyFeeInGwei = `${maxPriorityFeePerGas / Math.pow(10, 9)}`
      maxFeePerGas =
        maxFeePerGas || (await ethereumUtils.calculateMaxFeePerGas(providerUrl, priortyFeeInGwei))

      // Payload fields
      const nonce = await ethersProvider.getTransactionCount(this.eth.address, 'pending')
      const chainId = (await ethersProvider.getNetwork()).chainId
      const type = 2 // type 2: EIP1559; type 0: legacy

      const transactionPayload = {
        to: recipient,
        value: ethers.utils.parseEther(qty.toString()),
        maxPriorityFeePerGas,
        maxFeePerGas,
        nonce,
        chainId,
        type
      }

      const gasLimit = await signer.estimateGas(transactionPayload)
      transactionPayload.gasLimit = gasLimit || '21000'

      // Sign transaction
      const rawTransaction = await signer.signTransaction(transactionPayload)
      const signedTransaction = ethers.utils.parseTransaction(rawTransaction)
      const txHash = get(signedTransaction, 'hash')

      console.log('txHash', txHash)

      // Send transaction
      const sendingPromise = (await ethersProvider.sendTransaction(rawTransaction)).wait()

      return { txHash, sendingPromise }
    } catch (err) {
      console.error(`Failed to transfer ETH: ${err}`)
    }
  }

  async loadCollections() {
    return []
  }

  async nftBridge({
    txId,
    toAddress,
    type = TYPE.ARWEAVE,
    tokenAddress,
    tokenSchema,
    accountName
  }) {
    let bridgePending
    let pendingTransactions = (await this.#chrome.getField(ACCOUNT.PENDING_TRANSACTION)) || []
    let assets = await this.#chrome.getAssets()
    let success, action, result

    try {
      switch (type) {
        case TYPE.ARWEAVE:
          result = await this.#bridgeEthtoAr({ txId, toAddress, tokenAddress, tokenSchema })
          success = get(result, 'success')
          action = get(result, 'action')

          /* 
            Create pending bridge
          */
          if (success) {
            if (action === ETH_NFT_BRIDGE_ACTION.DEPOSIT) {
              bridgePending = {
                id: txId,
                activityName: chrome.i18n.getMessage('bridgeETHtoAR'),
                expense: 0,
                accountName,
                date: moment().format('MMMM DD YYYY'),
                source: toAddress,
                address: this.eth.address,
                tokenAddress,
                tokenSchema,
                retried: 1
              }
              pendingTransactions.unshift(bridgePending)
              /*
               Set isBridging:true to asset
              */
              assets = assets.map((nft) => {
                if (nft.txId === txId) nft.isBridging = true
                return nft
              })
              await this.#chrome.setAssets(assets)
              await this.#chrome.setField(ACCOUNT.PENDING_TRANSACTION, pendingTransactions)
            }
          } else {
            return false
          }

          return true
        default:
          return false
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async #bridgeEthtoAr({ txId: tokenId, toAddress, tokenAddress, tokenSchema }) {
    if (!this.eth.provider) throw new Error('Something went wrong.')
    let koiRouterContractAddress = null

    if (includes(this.eth.provider, 'mainnet')) {
      koiRouterContractAddress = KOI_ROUTER_CONTRACT.MAINNET
    }

    if (includes(this.eth.provider, 'goerli')) {
      koiRouterContractAddress = KOI_ROUTER_CONTRACT.GOERLI
    }

    if (!koiRouterContractAddress) throw new Error('Something went wrong.')

    console.log('KOI ROUTER CONTRACT', koiRouterContractAddress)

    console.log('BRIDGING...')
    const { balance } = await this.getBalances()
    /* 
      Validations
    */
    if (!includes(VALID_TOKEN_SCHEMA, tokenSchema))
      throw new Error(chrome.i18n.getMessage('invalidTokenSchema'))
    if (balance < 0.00015) throw new Error(chrome.i18n.getMessage('notEnoughETHToken'))

    const provider = new HDWalletProvider(this.eth.key, this.eth.getCurrentNetWork())
    const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)

    const network = ethers.providers.getNetwork(ethNetwork)
    const web3 = new ethers.providers.InfuraProvider(network, apiKey)

    const userAddress = this.eth.address

    // const koiRouterContract = new web3.eth.Contract(koiRouterABI, koiRouterContractAddress)
    const koiRouterContract = new ethers.Contract(koiRouterContractAddress, koiRouterABI, web3)

    // const tokenContract = new web3.eth.Contract(tokenAddress, koiTokenABI, web3)
    const tokenContract = new ethers.Contract(tokenAddress, koiTokenABI, web3)

    /* 
      Check for approval
      If not approved, setApprovalForAll()
    */
    // TODO DatH - test manifestv3
    let isApproved = false
    try {
      // isApproved = await tokenContract.methods
      //   .isApprovedForAll(userAddress, koiRouterContractAddress)
      //   .call()
      isApproved = await tokenContract.isApprovedForAll(userAddress, koiRouterContractAddress)
    } catch (error) {
      console.log('isApprovedForAll error', error)
    }
    // TODO DatH - test manifestv3
    if (!isApproved) {
      try {
        console.log('SET APPROVAL...')
        const res = await tokenContract.methods
          .setApprovalForAll(koiRouterContractAddress, true)
          .send({ from: userAddress })
        console.log('setApprovalForAll receipt', res)
        return { success: true, action: ETH_NFT_BRIDGE_ACTION.SET_APPROVAL }
      } catch (error) {
        console.log('setApprovalForAll error', error)
        return { success: false, action: ETH_NFT_BRIDGE_ACTION.SET_APPROVAL }
      }
    } else {
      // TODO DatH - test manifestv3
      try {
        const depositResult = await koiRouterContract.methods
          .deposit(tokenAddress, tokenId, 1, toAddress)
          // .send({ from: userAddress, value: web3.utils.toWei('0.00015', 'ether') })
          .send({ from: userAddress, value: ethers.utils.parseEther('0.00015') })
        console.log('Deposit receipt ', depositResult)
        return { success: true, action: ETH_NFT_BRIDGE_ACTION.DEPOSIT }
      } catch (error) {
        console.log('Deposit error', error)
        return { success: false, action: ETH_NFT_BRIDGE_ACTION.SET_APPROVAL }
      }
    }
  }

  async transactionConfirmedStatus(txHash) {
    try {
      const rpcUrl = await storage.setting.get.ethereumProvider()
      const etherProvider = await getEthereumNetworkProvider(rpcUrl)

      const receipt = await etherProvider.getTransactionReceipt(txHash)

      if (receipt && receipt.blockNumber) {
        return { dropped: false, confirmed: true }
      } else {
        return { dropped: false, confirmed: false }
      }
    } catch (error) {
      console.error('Error:', error)
      return { dropped: false, confirmed: false }
    }
  }

  async getNftData(contents, getBase64) {
    try {
      const provider = this.eth.provider
      let etherscanUrl
      if (provider === ETH_NETWORK_PROVIDER.MAINNET) etherscanUrl = URL.ETHERSCAN_MAINNET
      if (provider === ETH_NETWORK_PROVIDER.GOERLI) etherscanUrl = URL.ETHERSCAN_GOERLI

      let fetchedNFTs = await Promise.all(
        contents.map(async (content) => {
          try {
            const tokenId = content?.token_id
            const addressContract = content?.asset_contract?.address
            const koiRockUrl = `${etherscanUrl}/token/${addressContract}?a=${tokenId}`

            if (content.image_url && content.name) {
              let imageUrl = content.image_url
              if (getBase64) {
                let u8 = Buffer.from(
                  (
                    await axios.request({
                      url: content.image_url,
                      responseType: 'arraybuffer',
                      method: 'GET',
                      adapter: axiosAdapter
                    })
                  ).data,
                  'binary'
                ).toString('base64')
                imageUrl = `data:image/jpeg;base64,${u8}`
                if (content.image_url.endsWith('.svg')) {
                  imageUrl = `data:image/svg+xml;base64,${u8}`
                }

                if (content.animation_url) {
                  u8 = Buffer.from(
                    (
                      await axios.request({
                        url: content.animation_url,
                        responseType: 'arraybuffer',
                        method: 'GET',
                        adapter: axiosAdapter
                      })
                    ).data,
                    'binary'
                  ).toString('base64')
                  imageUrl = `data:video/mp4;base64,${u8}`
                }
              }

              return {
                name: content.name,
                isKoiWallet: false,
                txId: `${content.token_id}_${content.asset_contract?.address}`,
                imageUrl,
                galleryUrl: `${PATH.GALLERY}#/details/${content.token_id}_${content.asset_contract?.address}`,
                koiRockUrl,
                isRegistered: false,
                contentType: content.animation_url ? 'video' : 'image',
                totalViews: 0,
                createdAt: Date.parse(get(content, 'collection.created_date')) / 1000,
                description: content.description,
                type: TYPE.ETHEREUM,
                address: this.eth.address,
                tokenAddress: content?.asset_contract?.address,
                tokenSchema: content?.asset_contract?.schema_name // ERC compatiblility. eg: ERC1155,...
              }
            } else {
              console.log('Not enough data NFT: ', content)
              return null
            }
          } catch (err) {
            console.log('Failed loaded NFT: ', content)
            return null
          }
        })
      )

      // Filter failed load contents
      fetchedNFTs = fetchedNFTs.filter((nft) => !!nft)
      return fetchedNFTs
    } catch (err) {
      console.log(err.message)
      return []
    }
  }

  async getBridgeStatus(txId) {
    const payload = {
      ethereumNFTId: txId,
      flow: BRIDGE_FLOW.ETH_TO_AR
    }

    let response = await fetch(URL.GET_BRIDGE_STATUS, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    response = await response.json()
    console.log('Bridge status', response)

    let isBridged = get(response, 'data[0].isBridged')
    console.log('isBridged', isBridged)
    return { confirmed: isBridged, dropped: false }
  }

  async resendTransaction(txId) {
    let pendingTransactions = await this.#chrome.getField(ACCOUNT.PENDING_TRANSACTION)
    // find the appropriate transaction
    let transaction = find(pendingTransactions, (tx) => tx.id === txId)
    let newTxId
    if (transaction) {
      const { activityName } = transaction
      if (includes(activityName, 'Bridged')) {
        await this.#bridgeEthtoAr({
          txId,
          toAddress: transaction.source,
          tokenAddress: transaction.tokenAddress,
          tokenSchema: transaction.tokenSchema
        })
        newTxId = txId
      }

      /* 
        Set newTxId for the pending transaction
      */
      if (newTxId) {
        pendingTransactions = pendingTransactions.map((transaction) => {
          if (transaction.id === txId) {
            transaction.id = newTxId
            if (transaction.retried !== undefined) transaction.retried = 0
            transaction.retried++
          }
          return transaction
        })

        await this.#chrome.setField(ACCOUNT.PENDING_TRANSACTION, pendingTransactions)
      } else {
        // TODO: refactor
        pendingTransactions = pendingTransactions.map((transaction) => {
          if (transaction.id === txId) {
            if (transaction.retried !== undefined) transaction.retried = 0
            transaction.retried++
          }
          return transaction
        })

        await this.#chrome.setField(ACCOUNT.PENDING_TRANSACTION, pendingTransactions)
      }

      return transaction
    }
  }

  // TODO - DatH Switch to ethers
  async getNetworkId() {
    // return this.eth.web3().eth.net.getId()
    return (await this.eth.web3().getNetwork()).chainID
  }

  async transferToken({ tokenContractAddress, to, value, maxPriorityFeePerGas, maxFeePerGas }) {
    try {
      const providerUrl = await storage.setting.get.ethereumProvider()
      const { ethersProvider, wallet } = await ethereumUtils.initEthersProvider(
        providerUrl,
        this.eth.key
      )
      const signer = wallet.connect(ethersProvider)

      const tokenContract = new ethers.Contract(tokenContractAddress, ERC20ABI, signer)
      const symbol = await tokenContract.symbol()
      const decimals = await tokenContract.decimals()

      const erc20Interface = new ethers.utils.Interface(ERC20ABI)
      const data = erc20Interface.encodeFunctionData('transfer', [to, value])

      const nonce = await ethersProvider.getTransactionCount(this.eth.address, 'pending')
      const chainId = (await ethersProvider.getNetwork()).chainId
      const type = 2 // type 2: EIP1559; type 0: legacy

      const gasLimit = (await tokenContract.estimateGas?.transfer(to, value)).toNumber()
      // Gas
      maxPriorityFeePerGas = maxPriorityFeePerGas || 2.5 * Math.pow(10, 9)
      const priortyFeeInGwei = `${maxPriorityFeePerGas / Math.pow(10, 9)}`
      maxFeePerGas =
        maxFeePerGas || (await ethereumUtils.calculateMaxFeePerGas(providerUrl, priortyFeeInGwei))

      const transactionPayload = {
        to: tokenContractAddress,
        data,
        maxPriorityFeePerGas,
        maxFeePerGas,
        nonce,
        chainId,
        type,
        gasLimit
      }
      console.log('transactionPayload', transactionPayload)

      const rawTransaction = await wallet.signTransaction(transactionPayload)
      const signedTransaction = ethers.utils.parseTransaction(rawTransaction)
      const txHash = signedTransaction?.hash
      console.log('txHash', txHash)
      const sendingPromise = (await ethersProvider.sendTransaction(rawTransaction)).wait()

      return { txHash, sendingPromise, symbol, decimals }
    } catch (err) {
      console.error(`Failed to transfer: ${err}`)
    }
  }

  async transferNFT(nftId, recipientAddress) {
    // Get nft with nftId
    let allNfts = await this.#chrome.getAssets()
    const nft = find(allNfts, { txId: nftId })

    // Initialize provider and wallet
    const providerUrl = await storage.setting.get.ethereumProvider()
    const { ethersProvider, wallet } = await ethereumUtils.initEthersProvider(
      providerUrl,
      this.eth.key
    )
    const signer = wallet.connect(ethersProvider)

    // Contract ABI and Contract Interface
    const contractABI = nft.tokenSchema === 'ERC721' ? ERC721ABI : ERC1155ABI
    const contractInterface = new ethers.utils.Interface(contractABI)

    // Token contract
    const nftContract = new ethers.Contract(nft.tokenAddress, contractABI, signer)

    // Gas
    const maxPriorityFeePerGas = ethers.utils.parseUnits('2.5', 'gwei')
    const maxFeePerGas = await ethereumUtils.calculateMaxFeePerGas(providerUrl, '2.5')

    // Payload fields
    const nonce = await ethersProvider.getTransactionCount(this.eth.address, 'pending')
    const chainId = (await ethersProvider.getNetwork()).chainId
    const type = 2 // type 2: EIP1559; type 0: legacy

    // Estimate gasLimit and encode function data
    const tokenId = nftId.split('_')[0]
    let gasLimit, data, transferFunction
    if (nft.tokenSchema === 'ERC721') {
      transferFunction = 'safeTransferFrom(address,address,uint256)'

      gasLimit = await nftContract.estimateGas[transferFunction](
        this.eth.address,
        recipientAddress,
        tokenId,
        { maxPriorityFeePerGas, maxFeePerGas }
      )

      data = contractInterface.encodeFunctionData(transferFunction, [
        this.eth.address,
        recipientAddress,
        tokenId
      ])
    } else {
      transferFunction = 'safeTransferFrom(address,address,uint256,uint256,bytes)'

      gasLimit = await nftContract.estimateGas[transferFunction](
        this.eth.address,
        recipientAddress,
        tokenId,
        '1',
        '0x01',
        {
          maxPriorityFeePerGas,
          maxFeePerGas
        }
      )

      data = contractInterface.encodeFunctionData(transferFunction, [
        this.eth.address,
        recipientAddress,
        tokenId,
        '1',
        '0x01'
      ])
    }

    const transactionPayload = {
      to: nft.tokenAddress,
      data,
      maxPriorityFeePerGas,
      maxFeePerGas,
      nonce,
      chainId,
      type,
      gasLimit
    }

    console.log('transactionPayload', transactionPayload)

    // Sign transaction
    const rawTransaction = await signer.signTransaction(transactionPayload)
    const signedTransaction = ethers.utils.parseTransaction(rawTransaction)
    const txHash = get(signedTransaction, 'hash')

    console.log('txHash', txHash)

    allNfts = allNfts.map((nft) => {
      if (nft.txId === nftId) nft.isSending = true
      return nft
    })
    await this.#chrome.setAssets(allNfts)

    // Send transaction
    await (await ethersProvider.sendTransaction(rawTransaction)).wait()

    return txHash
  }
}
