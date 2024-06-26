/* 
  Arweave method is functions to use when we have address and key of a wallet.
  Load activities, assets,...
*/

import axiosAdapter from '@vespaiach/axios-fetch-adapter'
import axios from 'axios'
import { ACCOUNT, TYPE } from 'constants/accountConstants'
import {
  ALL_NFT_LOADED,
  BRIDGE_FLOW,
  DELIGATED_OWNER,
  KOII_CONTRACT,
  PATH,
  URL
} from 'constants/koiConstants'
import {
  find,
  findIndex,
  get,
  includes,
  isArray,
  isEmpty,
  isNumber,
  isString,
  orderBy
} from 'lodash'
import moment from 'moment'
import { AccountStorageUtils } from 'services/account/AccountStorageUtils'
import arweave from 'services/arweave'
import storage from 'services/storage'
import { smartweave } from 'smartweave'
import { getChromeStorage, setChromeStorage } from 'utils'
import _signPort from 'utils/signPort'

export class ArweaveMethod {
  #chrome
  constructor(koi) {
    this.koi = koi
    this.#chrome = new AccountStorageUtils(koi.address)
  }

  async getBalances() {
    const balance = await this.koi.getWalletBalance()
    // const koiBalance = await this.koi.getKoiBalance()
    return { balance, koiBalance: 0 }
  }

  /**
   *
   * @returns res.contents NFTs array of an specified address at the moment this function invoked
   * @returns res.newContent NFT IDs array that will be used for "saveNewNFTsToStorage"
   */
  async loadMyContent() {
    try {
      const attentionState = await this.koi.getState('attention')
      const { nfts: allContent } = attentionState

      /* 
        get nft id list for this koi address
      */
      let myContent = await this.koi.getNftIdsByOwner(this.koi.address)
      myContent = myContent.filter((id) => {
        const nftOwners = allContent[id]
        // const balances = Object.values(nftOwners)
        // const isOwner = nftOwners[this.koi.address] === Math.max(...balances)
        const isOwner = nftOwners[this.koi.address] > 0

        return isOwner
      })
      console.log('Fetched contents: ', myContent.length)

      /*
        get nft list for this koi address from Chrome storage
      */
      const contentList =
        (await getChromeStorage(`${this.koi.address}_assets`))[`${this.koi.address}_assets`] || []
      console.log('Saved contents: ', contentList.length)

      /*
        There're two cases that NFTs will be filtered:
        - Failed load content (removed on functions cacheNFTs on "background/popupEventHandlers")
        - Sent NFTs (this address no longer own these NFTs)
      */
      const validContents = contentList.filter((content) => {
        return myContent.indexOf(content.txId) !== -1
      })
      console.log('Up to date saved content: ', validContents.length)

      /* 
        detect new nft(s) that were not saved in Chrome storage
      */
      const storageContentIds = validContents.map((nft) => nft.txId)
      const newContents = myContent.filter((nftId) => {
        return storageContentIds.indexOf(nftId) === -1
      })

      console.log('New contents: ', newContents.length)

      if (!newContents.length && myContent.length === contentList.length) {
        console.log('ALL NFT LOADED')
        return ALL_NFT_LOADED
      }

      /* 
        Array of new NFT with data filled
      */
      const newContentList = await this.getNftData(newContents)

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
    let fetchedData = []

    /* 
      "cursor" of a transaction will be used like an offset value
      we use "cursor" in order to track the position of a transaction on chain.
      For example: the 10th transaction has cursor of "abc"
      If we want to get the 11th transaction, instead of quering all transactions from 1 to 11, we can use cursor with value "abc"
      and request for just one transaction after that cursor.
    */
    let ownedCursor
    let recipientCursor

    let hasNextPageOwned = true
    let hasNextPageRecipient = true

    // get 300 latest transactions
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Load activities [${i + 1}/3]`)

        // get graphql resposne
        let ownedResponse, recipientResponse
        if (hasNextPageOwned)
          ownedResponse = await this.koi.getOwnedTxs(this.koi.address, 100, ownedCursor)
        if (hasNextPageRecipient)
          recipientResponse = await this.koi.getRecipientTxs(this.koi.address, 100, recipientCursor)

        // get hasNextPage
        hasNextPageOwned = get(ownedResponse, 'data.transactions.pageInfo.hasNextPage')
        hasNextPageRecipient = get(recipientResponse, 'data.transactions.pageInfo.hasNextPage')

        // get transactions
        const ownedTransactions = get(ownedResponse, 'data.transactions.edges') || []
        const recipientTransactions = get(recipientResponse, 'data.transactions.edges') || []

        // update cursor
        if (hasNextPageOwned) ownedCursor = ownedTransactions[ownedTransactions.length - 1].cursor
        if (hasNextPageRecipient)
          recipientCursor = recipientCursor[recipientTransactions.length - 1].cursor

        if (isArray(ownedTransactions) && isArray(recipientTransactions))
          fetchedData = [...fetchedData, ...ownedTransactions, ...recipientTransactions]
      } catch (err) {
        console.log('Update activities failed', err.message)
      }
    }

    console.log('TOTAL FETCHED: ', fetchedData.length)

    // sort by time - desc
    fetchedData = orderBy(fetchedData, 'node.block.timestamp', 'desc')

    // get accountName
    const accountName = await this.#chrome.getField(ACCOUNT.ACCOUNT_NAME)

    fetchedData = fetchedData
      .filter((activity) => !!get(activity, 'node.block'))
      .map((activity) => {
        try {
          const time = get(activity, 'node.block.timestamp')
          const timeString = isNumber(time) ? moment(time * 1000).format('MMMM DD YYYY') : ''
          const id = get(activity, 'node.id')
          let activityName = 'Sent AR'
          let expense =
            Number(get(activity, 'node.quantity.ar')) + Number(get(activity, 'node.fee.ar'))

          /* 
          GET TAGS
        */
          // get input tag
          let inputTag = get(activity, 'node.tags')
          if (!isArray(inputTag)) inputTag = []
          inputTag = inputTag.filter((tag) => tag.name === 'Input')

          // get Init State tag
          const initStateTag = get(activity, 'node.tags').filter((tag) => tag.name === 'Init-State')

          // get action tag
          const actionTag = get(activity, 'node.tags').filter((tag) => tag.name === 'Action')

          // get Koii-Did tag
          const koiiDidTag = get(activity, 'node.tags').filter((tag) => tag.name === 'Koii-Did')

          let source = get(activity, 'node.recipient')
          let inputFunction
          if (inputTag[0]) {
            inputFunction = JSON.parse(inputTag[0].value)
            if (inputFunction.function === 'transfer' || inputFunction.function === 'mint') {
              activityName = 'Sent KOII'
              if (inputFunction.isSendNft) {
                activityName = 'Sent NFT'
              } else {
                expense = inputFunction.qty
              }
              source = inputFunction.target
            } else if (inputFunction.function === 'updateCollection') {
              activityName = 'Updated Collection'
            } else if (inputFunction.function === 'updateKID') {
              activityName = 'Updated KID'
            } else if (inputFunction.function === 'lock') {
              activityName = 'Locked NFT'
            } else if (inputFunction.function === 'updateData') {
              activityName = 'Updated DID'
            } else if (inputFunction.function === 'burnKoi') {
              activityName = 'Burnt KOII'
              expense = 1
            } else if (inputFunction.function === 'register') {
              activityName = 'Registered KID'
            } else if (inputFunction.function === 'unregister') {
              activityName = 'Unregistered KID'
            }

            if (
              inputFunction.function === 'registerData' ||
              inputFunction.function === 'migratePreRegister'
            ) {
              activityName = 'Registered Data'
              source = null
            }
          }

          if (initStateTag[0]) {
            if (actionTag[0].value.includes('KID/Create')) {
              const initState = JSON.parse(initStateTag[0].value)
              activityName = `Created KID "${initState.name}"`
            } else if (actionTag[0].value.includes('Collection/Create')) {
              const initState = JSON.parse(initStateTag[0].value)
              activityName = `Created Collection "${initState.name}"`
            } else {
              const initState = JSON.parse(initStateTag[0].value)
              activityName = `Minted NFT "${initState.title}"`
            }
          }

          if (get(activity, 'node.owner.address') !== this.koi.address) {
            activityName = 'Received AR'
            source = get(activity, 'node.owner.address')
            expense -= Number(get(activity, 'node.fee.ar'))
            if (inputTag[0]) {
              inputFunction = JSON.parse(inputTag[0].value)
              if (inputFunction.function === 'transfer' || inputFunction.function === 'mint') {
                activityName = 'Received KOII'
                expense = inputFunction.qty
                source = inputFunction.target
              }
            }
          }

          if (!isEmpty(koiiDidTag)) {
            if (get(koiiDidTag, '[0].value') === 'CreateReactApp') activityName = 'Created DID'
            if (get(koiiDidTag, '[0].value') === 'CreateContract')
              activityName = 'Initialized DID data'
          }

          return {
            id,
            activityName,
            expense,
            accountName,
            date: timeString,
            source,
            time,
            address: this.koi.address,
            seen: true
          }
        } catch (err) {
          return {}
        }
      })

    console.log('RESULT: ', fetchedData.length)

    const oldActivites = (await this.#chrome.getActivities()) || []
    const newestOfOldActivites = oldActivites[0]

    if (newestOfOldActivites) {
      const idx = findIndex(fetchedData, (data) => data.id === newestOfOldActivites.id)

      for (let i = 0; i < idx; i++) {
        fetchedData[i].seen = false
      }
    }

    /* 
      Set activities to the local storage
    */
    await this.#chrome.setActivities(fetchedData)
  }

  async transfer(token, target, qty) {
    try {
      let balance, arBalance
      switch (token) {
        case 'KOI':
          balance = await this.koi.getKoiBalance()
          arBalance = await this.koi.getWalletBalance()
          if (arBalance < 0.00005) throw new Error(chrome.i18n.getMessage('notEnoughARToken'))
          if (qty > balance) throw new Error(chrome.i18n.getMessage('notEnoughKoiiToken'))
          break
        case 'AR':
          balance = await this.koi.getWalletBalance()
          if (qty + 0.0008 > balance) throw new Error(chrome.i18n.getMessage('notEnoughARToken'))
          break
      }
      const txId = await this.koi.transfer(qty, target, token)

      return txId
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async loadCollections() {
    try {
      const savedCollection = (await this.#chrome.getCollections()) || []
      // get list of transactions
      let fetchedCollections = await this.koi.getCollectionsByWalletAddress(this.koi.address)

      if (savedCollection.length == fetchedCollections.length) return 'fetched'

      // get list of transaction ids
      fetchedCollections = fetchedCollections.map((collection) => get(collection, 'node.id'))
      fetchedCollections = await this.#readState(fetchedCollections)

      // read state from the transaction id to get needed data for the collection
      fetchedCollections = await Promise.all(
        fetchedCollections.map((collection) => this.#getNftsDataForCollections(collection))
      )

      // filter collection has NFTs that cannot be found on the storage.
      fetchedCollections = fetchedCollections.filter((collection) => {
        return collection.nfts.every((nft) => nft)
      })
      console.log('fetchedCollections', fetchedCollections)
      return fetchedCollections
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async createCollection(collectionInfo, nftIds) {
    try {
      const collectionId = await this.koi.createCollection(collectionInfo)
      console.log('Collection ID: ', collectionId)
      return await this.#updateCollection(nftIds, collectionId)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadKID() {
    try {
      const data = await this.koi.getKIDByWalletAddress(this.koi.address)
      const txId = get(data[0], 'node.id')
      if (txId) {
        const imageUrl = `https://arweave.net/${txId}`
        const state = await smartweave.readContract(arweave, txId)
        return { imageUrl, ...state }
      }
    } catch (err) {
      console.log(err.message)
    }
  }

  async createOrUpdateKID(kidInfo, payload) {
    try {
      // Check had kid
      const hadKID = await this.#hadKIDCheck()
      if (hadKID) {
        // UPDATE KID
        return await this.koi.updateKID(kidInfo, hadKID)
      } else {
        // Create new kid
        const { fileType } = payload
        const { u8 } = await this.#getImageDataForNFT(fileType)
        const image = { blobData: u8, contentType: fileType }

        const txId = await this.koi.createKID(kidInfo, image)
        return txId
      }
    } catch (err) {
      console.log(err.message)
    }
  }

  /* 
    AFFILIATE CODE
  */
  async getAffiliateCode() {
    try {
      const signedPayload = await this.koi.signPayload({ data: { address: this.koi.address } })
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_REGISTER,
        data: {
          address: this.koi.address,
          signature: signedPayload.signature,
          publicKey: signedPayload.owner
        }
      })

      return get(data, 'data.affiliateCode')
    } catch (err) {
      console.log(err.message)
      throw new Error('Cannot get affiliateCode')
    }
  }

  async claimReward() {
    try {
      const signedPayload = await this.koi.signPayload({ data: { address: this.koi.address } })
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_CLAIM_REWARD,
        data: {
          address: this.koi.address,
          signature: signedPayload.signature,
          publicKey: signedPayload.owner
        }
      })
      return data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getRegistrationReward(nftId) {
    try {
      const signedPayload = await this.koi.signPayload({ data: { address: this.koi.address } })
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_REGISTRATION_REWARD,
        data: {
          address: this.koi.address,
          signature: signedPayload.signature,
          publicKey: signedPayload.owner,
          nftId
        }
      })

      return data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async submitInviteCode(code) {
    try {
      const signedPayload = await this.koi.signPayload({
        data: { address: this.koi.address, code }
      })
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_SUBMIT_CODE,
        data: {
          address: this.koi.address,
          code,
          signature: signedPayload.signature,

          publicKey: signedPayload.owner
        }
      })

      return data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getTotalRewardKoi() {
    try {
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_TOTAL_REWARD,
        data: {
          address: [this.koi.address]
        }
      })
      if (data.status !== 200) {
        return 0
      }

      return get(data, 'data.totalReward')
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async checkAffiliateInviteSpent() {
    try {
      const signedPayload = await this.koi.signPayload({
        data: { address: this.koi.address, code: 'code' }
      })
      const { data } = await axios({
        method: 'POST',
        url: PATH.AFFILIATE_SUBMIT_CODE,
        data: {
          address: this.koi.address,
          code: 'code',
          signature: signedPayload.signature,
          publicKey: signedPayload.owner
        }
      })

      if (data.message.toLowerCase().includes('already exists')) {
        return true
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /* 
    PRIVATE FUNCTIONS
  */
  async #updateCollection(nftIds, collectionId) {
    return await this.koi.updateCollection(nftIds, collectionId)
  }

  async #readState(txIds) {
    const result = await Promise.all(
      txIds.map(async (id) => {
        try {
          let state = await smartweave.readContract(arweave, id)
          const viewsAndReward = await this.koi.getViewsAndEarnedKOII(state.collection)
          state = { ...state, id, ...viewsAndReward }
          console.log('state', state)
          return state
        } catch (err) {
          return null
        }
      })
    )
    return result.filter((collection) => collection)
  }

  async #getNftsDataForCollections(collection) {
    const storageNfts = (await this.#chrome.getAssets()) || []

    const { collection: nftIds } = collection
    let nfts = nftIds.map((id) => {
      const nft = find(storageNfts, (v) => v.txId == id)
      if (nft) return nft
    })

    if (!nfts) nfts = []

    const resultCollection = { ...collection, nfts }
    return resultCollection
  }

  async #hadKIDCheck() {
    const data = await this.koi.getKIDByWalletAddress(this.koi.address)
    if (get(data[0], 'node.id')) {
      return get(data[0], 'node.id')
    }
    return false
  }

  async #getImageDataForNFT(fileType) {
    try {
      let bitObject = await storage.generic.get.nftBitData()
      if (!bitObject) return
      // parse the JSON string on local storage
      bitObject = JSON.parse(bitObject)

      // create 8 bit array from bit object
      const u8 = Uint8Array.from(Object.values(bitObject))

      // create blob from u8
      const blob = new Blob([u8], { type: 'contentType' })

      // create file from blob
      const file = new File([blob], 'filename', { type: fileType })

      return { u8, file }
    } catch (err) {
      throw new Error('')
    }
  }

  async nftBridge({ txId, toAddress, typeOfWallet: type, accountName }) {
    try {
      let bridgePending
      let pendingTransactions = (await this.#chrome.getField(ACCOUNT.PENDING_TRANSACTION)) || []
      let assets = await this.#chrome.getAssets()
      let success

      if (!type) type = TYPE.ETHEREUM

      switch (type) {
        case TYPE.ETHEREUM:
          success = await this.#fromArweaveToEthereum({ txId, toAddress })

          /* 
            Create pending bridge
          */
          if (success) {
            bridgePending = {
              id: txId,
              activityName: chrome.i18n.getMessage('bridgeARtoETH'),
              expense: 0,
              accountName,
              date: moment().format('MMMM DD YYYY'),
              source: toAddress,
              address: this.koi.address,
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
          } else {
            return false
          }
          break

        default:
          return false
      }

      return true
    } catch (err) {
      console.log('BRIDGE ERROR: ', err.message)
      return false
    }
  }

  async registerData(txId) {
    const _txId = await this.koi.burnKoiAttention(txId)
    console.log('BURN KOII')
    await this.koi.migrateAttention()
    console.log('MIGRATE')
    return _txId
  }

  async signPort(txId) {
    return await _signPort(txId, this.koi)
  }

  async transferNFT(nftId, address) {
    const input = {
      function: 'transfer',
      qty: 1,
      target: address,
      isSendNft: true
    }

    const txId = await this.#interactWrite(input, nftId)

    // update nft state
    let allNfts = await this.#chrome.getAssets()
    allNfts = allNfts.map((nft) => {
      if (nft.txId === nftId) nft.isSending = true
      return nft
    })
    await this.#chrome.setAssets(allNfts)

    return txId
  }

  async transactionConfirmedStatus(id) {
    const response = await arweave.transactions.getStatus(id)
    console.log('response', response)
    const dropped = response.status === 404
    const confirmed = !isEmpty(get(response, 'confirmed'))
    return { dropped, confirmed }
  }

  /* 
    Get data for input nftIds
  */
  async getNftData(nftIds, getBase64) {
    try {
      return await Promise.all(
        nftIds.map(async (contentId) => {
          try {
            const content = await this.koi.getNftState(contentId)
            if (content.title || content.name) {
              if (!get(content, 'contentType')) {
                const response = await fetch(`${PATH.NFT_IMAGE}/${content.id}`)
                const blob = await response.blob()
                const type = get(blob, 'type') || 'image/png'
                content.contentType = type
              }
              let url = `${PATH.NFT_IMAGE}/${content.id}`
              let imageUrl = url
              if (getBase64) {
                if (!includes(content.contentType, 'html')) {
                  const u8 = Buffer.from(
                    (
                      await axios.request({
                        url,
                        adapter: axiosAdapter,
                        method: 'GET',
                        responseType: 'arraybuffer'
                      })
                    ).data,
                    'binary'
                  ).toString('base64')
                  imageUrl = `data:${content.contentType};base64,${u8}`
                  if (content.contentType.includes('video'))
                    imageUrl = `data:video/mp4;base64,${u8}`
                }
              }

              return {
                name: content.title || content.name,
                // isKoiWallet: content.ticker === 'KOINFT',
                isKoiWallet: true,
                earnedKoi: content.reward,
                txId: content.id,
                imageUrl,
                galleryUrl: `${PATH.GALLERY}#/details/${content.id}`,
                koiRockUrl: `${PATH.KOII_LIVE}/${content.id}`,
                isRegistered: true,
                contentType: content.contentType,
                totalViews: content.attention,
                createdAt: content.createdAt,
                description: content.description,
                type: TYPE.ARWEAVE,
                address: this.koi.address,
                locked: content.locked,
                tags: content.tags,
                isPrivate: content.isPrivate === undefined ? 'undefined' : content.isPrivate
              }
            } else {
              console.log('Failed load content: ', content)
              return {
                name: '...',
                isKoiWallet: true,
                earnedKoi: content.reward,
                txId: content.id,
                imageUrl: 'https://koi.rocks/static/media/item-temp.49349b1b.jpg',
                galleryUrl: `${PATH.GALLERY}#/details/${content.id}`,
                koiRockUrl: `${PATH.KOII_LIVE}/${content.id}`,
                isRegistered: true,
                contentType: content.contentType || 'image',
                totalViews: content.attention,
                createdAt: content.createdAt,
                description: content.description,
                type: TYPE.ARWEAVE,
                address: this.koi.address,
                locked: content.locked,
                tags: content.tags,
                isPrivate: content.isPrivate === undefined ? 'undefined' : content.isPrivate
              }
            }
          } catch (err) {
            console.log(err.message)
            throw new Error(err.message)
          }
        })
      )
    } catch (err) {
      console.log(err.message)
      return []
    }
  }

  async getNfts(nftIds, getBase64) {
    try {
      return await Promise.all(
        nftIds.map(async (contentId) => {
          try {
            const content = await this.koi.getNftState(contentId)
            if (content.title || content.name) {
              if (!get(content, 'contentType')) {
                const response = await fetch(`${PATH.NFT_IMAGE}/${content.id}`)
                const blob = await response.blob()
                const type = get(blob, 'type') || 'image/png'
                content.contentType = type
              }
              let url = `${PATH.NFT_IMAGE}/${content.id}`
              let imageUrl = url
              if (getBase64) {
                if (!includes(content.contentType, 'html')) {
                  const u8 = Buffer.from(
                    (
                      await axios.request({
                        url,
                        adapter: axiosAdapter,
                        method: 'GET',
                        responseType: 'arraybuffer'
                      })
                    ).data,
                    'binary'
                  ).toString('base64')
                  imageUrl = `data:${content.contentType};base64,${u8}`
                  if (content.contentType.includes('video'))
                    imageUrl = `data:video/mp4;base64,${u8}`
                }
              }

              return {
                name: content.title || content.name,
                // isKoiWallet: content.ticker === 'KOINFT',
                isKoiWallet: true,
                earnedKoi: content.reward,
                txId: content.id,
                imageUrl,
                galleryUrl: `${PATH.GALLERY}#/details/${content.id}`,
                koiRockUrl: `${PATH.KOII_LIVE}/${content.id}`,
                isRegistered: true,
                contentType: content.contentType,
                totalViews: content.attention,
                createdAt: content.createdAt,
                description: content.description,
                type: TYPE.ARWEAVE,
                address: content.owner,
                locked: content.locked,
                tags: content.tags,
                isPrivate: content.isPrivate === undefined ? 'undefined' : content.isPrivate
              }
            } else {
              console.log('Failed load content: ', content)
              return {
                name: '...',
                isKoiWallet: true,
                earnedKoi: content.reward,
                txId: content.id,
                imageUrl: 'https://koi.rocks/static/media/item-temp.49349b1b.jpg',
                galleryUrl: `${PATH.GALLERY}#/details/${content.id}`,
                koiRockUrl: `${PATH.KOII_LIVE}/${content.id}`,
                isRegistered: true,
                contentType: content.contentType || 'image',
                totalViews: content.attention,
                createdAt: content.createdAt,
                description: content.description,
                type: TYPE.ARWEAVE,
                address: content.owner,
                locked: content.locked,
                tags: content.tags,
                isPrivate: content.isPrivate === undefined ? 'undefined' : content.isPrivate
              }
            }
          } catch (err) {
            console.log(err.message)
          }
        })
      )
    } catch (err) {
      console.log(err.message)
      return []
    }
  }

  async updateNftStates() {
    console.log('Update Nft state...')
    const allNfts = await this.#chrome.getAssets()
    const nftIds = await allNfts.map((nft) => nft.txId)

    const updatedNfts = await this.getNftData(nftIds)

    console.log('Updated Nft: ', updatedNfts.length)

    if (updatedNfts.length > 0) {
      await this.#chrome.setAssets(updatedNfts)
    }
  }

  async getBridgeStatus(txId) {
    const payload = {
      arNFTId: txId,
      flow: BRIDGE_FLOW.AR_TO_ETH
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

  async signTx(transaction) {
    await arweave.transactions.sign(transaction, this.koi.wallet)
  }

  async registerNft(nftId) {
    await this.koi.burnKoiAttention(nftId)
    await this.koi.migrateAttention()
  }

  async #interactWrite(input, contract) {
    const _contract = contract || KOII_CONTRACT

    return await smartweave.interactWrite(arweave, this.koi.wallet, _contract, input)
  }

  /* PRIVATE */
  #base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64)
    const len = binary_string.length
    const bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  }

  async #fromArweaveToEthereum({ txId: nftId, toAddress: ethereumAddress }) {
    try {
      if (!isString(nftId) || !isString(ethereumAddress))
        throw new Error('Invalid input for bridging')

      // lock nft
      const key = this.koi.wallet
      const lockInput = {
        function: 'lock',
        delegatedOwner: DELIGATED_OWNER,
        qty: 1,
        address: ethereumAddress,
        network: 'ethereum'
      }
      const lockTransactionId = await smartweave.interactWrite(arweave, key, nftId, lockInput)
      console.log('[Arweave to Ethereum 1/3] Lock transactionId: ', lockTransactionId)

      // transfer 10 KOII
      const koiiContract = this.koi.contractId
      const transferInput = {
        function: 'transfer',
        qty: 10,
        target: '6E4APc5fYbTrEsX3NFkDpxoI-eaChDmRu5nqNKOn37E',
        nftId: nftId,
        lockTx: lockTransactionId
      }
      const transferTransactionId = await smartweave.interactWrite(
        arweave,
        key,
        koiiContract,
        transferInput
      )
      console.log('[Arweave to Ethereum 2/3] Transfer transactionId: ', transferTransactionId)

      // send post request
      const payload = {
        arNFTId: nftId,
        arUserAddress: this.koi.address,
        burnKOItx: transferTransactionId,
        lockedNFTtx: lockTransactionId
      }

      const rawResposne = await fetch('https://devbundler.openkoi.com:8885/mintEthToken', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('[Arweave to Ethereum 3/3] Send submit request: ', await rawResposne.json())

      return true
    } catch (err) {
      console.log('BRDIGE ERROR: ', err.message)
      return false
    }
  }
}
