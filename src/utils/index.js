import { LOAD_KOI_BY, PATH, STORAGE, ERROR_MESSAGE, NFT_BIT_DATA, ALL_NFT_LOADED } from 'koiConstants'
import passworder from 'browser-passworder'
import moment from 'moment'
import { get, isNumber, isArray } from 'lodash'


import Arweave from 'arweave'
import axios from 'axios'

import { Web } from '@_koi/sdk/web'
export const koi = new Web()

import storage from 'storage'

/* istanbul ignore next */
const arweave = Arweave.init({ host: 'arweave.net', protocol: 'https', port: 443, })
/* istanbul ignore next */

/* istanbul ignore next */
export const setChromeStorage = (obj) => {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.set(obj, () => {
      resolve()
    })
  })
}

/* istanbul ignore next */
export const getChromeStorage = (key) => {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(key, (result) => {
      resolve(result)
    })
  })
}

/* istanbul ignore next */
export const removeChromeStorage = (key) => {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.remove(key, () => {
      resolve()
    })
  })
}

/* istanbul ignore next */
export const clearChromeStorage = (key) => {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.clear(() => {
      resolve()
    })
  })
}

export const getBalances = async (koiObj) => {
  const [arBalance, koiBalance] = await Promise.all([koiObj.getWalletBalance(), koiObj.getKoiBalance()])  
  koiObj.balance = arBalance  

  await storage.arweaveWallet.set.balance(koiObj['balance'])
  await storage.generic.set.koiBalance(koiBalance)

  return {
    arBalance: koiObj.balance,
    koiBalance: koiBalance
  }
}

export const loadWallet = async (koiObj, data, loadBy) => {
  try {
    switch (loadBy) {
      case LOAD_KOI_BY.ADDRESS:
        koiObj.address = data
        break
      case LOAD_KOI_BY.KEY:
        await koiObj.loadWallet(data)
        break
    }

    return {
      address: koiObj.address
    }

  } catch (err) {
    throw new Error(err.message)
  }
}

export const generateWallet = async (koiObj) => {
  try {
    await koiObj.generateWallet(true)
    return koiObj.mnemonic
  } catch (err) {
    throw new Error(err.message)
  }
}

export const loadMyContent = async (koiObj) => {
  try {
    const { data: allContent } = await axios.get(PATH.ALL_CONTENT)
    console.log({ allContent })
    const myContent = (allContent.filter(content => get(content[Object.keys(content)[0]], 'owner') === koiObj.address)).map(content => Object.keys(content)[0])
    console.log({ myContent })
    const contentList = await storage.arweaveWallet.get.assets() || []
    if (myContent.length === contentList.length) return ALL_NFT_LOADED
    return Promise.all(myContent.map(async contentId => {
      try {
        console.log(`${PATH.SINGLE_CONTENT}${contentId}`)
        const { data: content } = await axios.get(`${PATH.SINGLE_CONTENT}${contentId}`)
        console.log({ content })
        if (content.title) {
          let url = `${PATH.NFT_IMAGE}/${content.txIdContent}`
          if (content.fileLocation) url = content.fileLocation
          const u8 = Buffer.from((await axios.get(url, { responseType: 'arraybuffer'})).data, 'binary').toString('base64')
          let imageUrl = `data:image/jpeg;base64,${u8}`
          if (content.contentType.includes('video')) imageUrl = `data:video/mp4;base64,${u8}`
          return {
            name: content.title,
            isKoiWallet: content.ticker === 'KOINFT',
            earnedKoi: content.totalReward,
            txId: content.txIdContent,
            imageUrl,
            galleryUrl: `${PATH.GALLERY}#/details/${content.txIdContent}`,
            koiRockUrl: `${PATH.KOI_ROCK}/${content.txIdContent}`,
            isRegistered: true,
            contentType: content.contentType,
            totalViews: content.totalViews,
            createdAt: content.createdAt,
            description: content.description
          }
        } else {
          console.log('Failed load content: ', content)
          return {
            name: '...',
            isKoiWallet: true,
            earnedKoi: content.totalReward,
            txId: content.txIdContent,
            imageUrl: 'https://koi.rocks/static/media/item-temp.49349b1b.jpg',
            galleryUrl: `${PATH.GALLERY}#/details/${content.txIdContent}`,
            koiRockUrl: `${PATH.KOI_ROCK}/${content.txIdContent}`,
            isRegistered: true,
            contentType: content.contentType || 'image',
            totalViews: content.totalViews,
            createdAt: content.createdAt,
            description: content.description
          }
        }
      } catch (err) {
        console.log(err.message)
        return {
          isRegistered: false,
          isKoiWallet: false
        }
      }

    }))
  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
export const loadMyActivities = async (koiObj, cursor) => {
  try {
    const { ownedCursor, recipientCursor } = cursor

    let ownedData
    let recipientData
    
    // fetch data base on inputed cursors
    if (ownedCursor) {
      ownedData = get(await koiObj.getOwnedTxs(koiObj.address, 10, ownedCursor), 'data.transactions.edges') || []
    } else {
      ownedData = get(await koiObj.getOwnedTxs(koiObj.address), 'data.transactions.edges') || []
    }
  
    if (recipientCursor) {
      recipientData = get(await koiObj.getRecipientTxs(koiObj.address, 10, recipientCursor), 'data.transactions.edges') || []
    } else {
      recipientData = get(await koiObj.getRecipientTxs(koiObj.address), 'data.transactions.edges') || []
    }
  
    let activitiesList = [...ownedData, ...recipientData]
    console.log('ACTIVITIES LIST BACKGROUND: ', activitiesList)
    // get next cursors
    const nextOwnedCursor = ownedData.length > 0 ? get(ownedData[ownedData.length - 1], 'cursor') : ownedCursor
    const nextRecipientCursor = recipientData.length > 0 ? get(recipientData[recipientData.length - 1], 'cursor') : recipientCursor

    if (activitiesList.length > 0) {

      // filter activities has node.block (success fetched activities) field then loop through to get necessary fields
      activitiesList = activitiesList.filter(activity => !!get(activity, 'node.block')).map(activity => {
        const time = get(activity, 'node.block.timestamp')
        const timeString = isNumber(time) ? moment(time*1000).format('MMMM DD YYYY') : ''
        const id = get(activity, 'node.id')
        let activityName = 'Sent AR'
        let expense = Number(get(activity, 'node.quantity.ar')) + Number(get(activity, 'node.fee.ar'))

        // get input tag
        let inputTag = (get(activity, 'node.tags'))
        if (!isArray(inputTag)) inputTag = []
        inputTag = inputTag.filter(tag => tag.name === 'Input')

        // get Init State tag
        const initStateTag = (get(activity, 'node.tags')).filter(tag => tag.name === 'Init-State')

        // get action tag
        const actionTag = ((get(activity, 'node.tags')).filter(tag => tag.name === 'Action'))
        let source = get(activity, 'node.recipient')
        let inputFunction
        if (inputTag[0]) {
          inputFunction = JSON.parse(inputTag[0].value)
          if (inputFunction.function === 'transfer' || inputFunction.function === 'mint') {
            activityName = 'Sent KOII'
            expense = inputFunction.qty
            source = inputFunction.target
          } else if (inputFunction.function === 'updateCollection') {
            activityName = 'Updated Collection'
          } else if (inputFunction.function === 'updateKID') {
            activityName = 'Updated KID'
          }

          if (inputFunction.function === 'registerData') {
            activityName = 'Registered NFT'
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

        if (get(activity, 'node.owner.address') !== koiObj.address) {
          activityName = 'Received AR'
          source = get(activity, 'node.owner.address')
          expense -= Number(get(activity, 'node.fee.ar'))
          if (inputTag[0]) {
            inputFunction = JSON.parse(inputTag[0].value)
            if (inputFunction.function === 'transfer' || inputFunction.function === 'mint') {
              activityName = 'Received KOI'
              expense = inputFunction.qty
              source = inputFunction.target
            }
          }
        }

        return {
          id,
          activityName,
          expense,
          accountName: 'Account 1',
          date: timeString,
          source
        }
      })
    }
    return { activitiesList, nextOwnedCursor, nextRecipientCursor }
  } catch(err) {
    throw new Error(err.message)
  }
}

export const transfer = async (koiObj, qty, address, currency) => {
  try {
    let balance
    switch (currency) {
      case 'KOI':
        balance = await koiObj.getKoiBalance()
        if (qty > balance) throw new Error(ERROR_MESSAGE.NOT_ENOUGH_KOI)
        break
      case 'AR':
        balance = await koiObj.getWalletBalance()
        if (qty > balance) throw new Error(ERROR_MESSAGE.NOT_ENOUGH_AR)
        break
    }
    const txId = await koiObj.transfer(qty, address, currency)
    return txId

  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
export const saveWalletToChrome = async (koiObj, password) => {
  try {
    const encryptedWalletKey = await passworder.encrypt(password, koiObj.wallet)
    await setChromeStorage({ 'koiAddress': koiObj.address, 'koiKey': encryptedWalletKey })
  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
export const decryptWalletKeyFromChrome = async (password) => {
  try {
    const result = await getChromeStorage(STORAGE.KOI_KEY)
    const key = await passworder.decrypt(password, result[STORAGE.KOI_KEY])
    return key
  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
export const decryptSeedPhraseFromChrome = async (password) => {
  try {
    const result = await getChromeStorage(STORAGE.KOI_PHRASE)
    if (!result[STORAGE.KOI_PHRASE]) return
    const phrase = await passworder.decrypt(password, result[STORAGE.KOI_PHRASE])
    return phrase
  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
export const removeWalletFromChrome = async () => {
  try {
    await Promise.all(Object.keys(STORAGE).map(key => removeChromeStorage(key)))
  } catch (err) {
    throw new Error(err.message)
  } 
}

/* istanbul ignore next */
export const JSONFileToObject = async (file) => {
  try {
    const fileText = await file.text()
    return JSON.parse(fileText)
  } catch (err) {
    throw new Error(err.message)
  }
}

/* istanbul ignore next */
// export const checkSitePermission = async (origin) => {
//   try {
//     let approvedOrigin = (await getChromeStorage(STORAGE.SITE_PERMISSION))[STORAGE.SITE_PERMISSION]
//     if (!approvedOrigin) approvedOrigin = []
//     return approvedOrigin.includes(origin)
//   } catch (err) {
//     throw new Error(err.message)
//   }
// }

/* istanbul ignore next */
// export const saveOriginToChrome = async (origin) => {
//   try {
//     let approvedOrigin = (await getChromeStorage(STORAGE.SITE_PERMISSION))[STORAGE.SITE_PERMISSION]
//     if (!approvedOrigin) approvedOrigin = []
//     approvedOrigin.push(origin)
//     await setChromeStorage({ 'sitePermission': approvedOrigin })
//   } catch (err) {
//     console.log(err.message)
//     throw new Error(err.message)
//   }
// }

/* istanbul ignore next */
// export const deleteOriginFromChrome = async (aOrigin) => {
//   try {
//     let approvedOrigin = (await getChromeStorage(STORAGE.SITE_PERMISSION))[STORAGE.SITE_PERMISSION]
//     if (!approvedOrigin) approvedOrigin = []
//     approvedOrigin = approvedOrigin.filter(origin => origin !== aOrigin)
//     await setChromeStorage({ 'sitePermission': approvedOrigin })
//   } catch (err) {
//     console.log(err.message)
//     throw new Error(err.message)
//   }
// }

/* istanbul ignore next */
export const signTransaction = async (koiObj, transaction) => {
  try {
    let tx
    console.log({ transaction })
    if (transaction.data) {
      console.log('TRANSACTION WITH DATA')
      transaction.data = JSON.parse(transaction.data)
      const data = Uint8Array.from(Object.values(transaction.data))
      tx = await arweave.createTransaction({ data })
      tx.data_root = transaction.data_root
      const { tags } = transaction
      tags.forEach((tag) => {
        console.log('TAG', atob(tag.name), atob(tag.value))
        tx.addTag(atob(tag.name), atob(tag.value))
      })
    } else {
      console.log('TRANSFER TRANSACTION')
      tx = await arweave.createTransaction({ target: transaction.target, quantity: transaction.quantity })
    }
    console.log({ tx })
    console.log(await arweave.transactions.getPrice(tx.data_size))
    const result = await koiObj.signTransaction(tx)
    result.data = []
    return result
  } catch (err) {
    console.log(err.message)
  }
}

export const numberFormat = (num) => {
  return num === null ? '---' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num)
}

export const fiatCurrencyFormat = (num) => {
  return num === null ? '---' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num)
}

export const transactionAmountFormat = (num) => {
  return num === null ? '---' : `${Math.round(num * Math.pow(10, 6)) / Math.pow(10, 6)}`
}

export const getAccountName = async ()  => {
  const name = await storage.arweaveWallet.get.accountName()
  return name
}

export const updateAccountName = async (name) => {
  await storage.arweaveWallet.set.accountName(name)
  return name
}

export const loadNFTCost = async (size, address) => {
  const price = await arweave.transactions.getPrice(size, address)
  return price / 1000000000000
}

export const getAffiliateCode = async (koi) => {
  try {
    const signedPayload = await koi.signPayload({ data: { address: koi.address } })
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_REGISTER,
      data: {
        address: koi.address,
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

export const claimReward = async (koi) => {
  try {
    const signedPayload = await koi.signPayload({ data: { address: koi.address } })
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_CLAIM_REWARD,
      data: {
        address: koi.address,
        signature: signedPayload.signature,
        publicKey: signedPayload.owner
      }
    })
    return data
  } catch (err) {
    throw new Error(err.message)
  }
}

export const getRegistrationReward = async (koi, nftId) => {
  console.log('NFT ID: ', nftId)
  try {
    const signedPayload = await koi.signPayload({ data: { address: koi.address }})
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_REGISTRATION_REWARD,
      data: {
        address: koi.address,
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

export const submitInviteCode = async (koi, code) => {
  try {
    const signedPayload = await koi.signPayload({ data: { address: koi.address, code } })
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_SUBMIT_CODE,
      data: {
        address: koi.address,
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

export const getTotalRewardKoi = async (koi) => {
  try {
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_TOTAL_REWARD,
      data: {
        address: [koi.address]
      }
    })
    if (status !== 200) {
      return 0
    }

    return get(data, 'data.totalReward')
  } catch(err) {
    throw new Error(err.message)
  }
}

export const checkAffiliateInviteSpent = async (koi) => {
  try {
    const signedPayload = await koi.signPayload({ data: { address: koi.address, code: 'code' } })
    const { data } = await axios({
      method: 'POST',
      url: PATH.AFFILIATE_SUBMIT_CODE,
      data: {
        address: koi.address,
        code: 'code',
        signature: signedPayload.signature,
        publicKey: signedPayload.owner
      }
    })

    if (((data.message).toLowerCase()).includes('already exists')) {
      return true
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

export const getImageDataForNFT = async (fileType) => {
  try {
    const storage = await getChromeStorage(NFT_BIT_DATA)
    let bitObject = storage[NFT_BIT_DATA]
    console.log('background- bitObject', storage)
    if (!bitObject) return
    // parse the JSON string on local storage
    bitObject = JSON.parse(bitObject)
    console.log('bitObject', bitObject)
    // create 8 bit array from bit object
    const u8 = Uint8Array.from(Object.values(bitObject))
    console.log('u8', u8)
    // create blob from u8
    const blob = new Blob([u8], { type: 'contentType'})
    console.log('blob', blob)
    // create file from blob
    const file = new File([blob], 'filename', { type: fileType })
    console.log(file)
    return { u8, file }
  } catch (err) {
    throw new Error(err.message)
  }
}

export const exportNFTNew = async (koi, arweave, content, tags, fileType) => {
  const bundlerUrl = 'https://devbundler.openkoi.com:8888'
  try {
    const { u8, file } = await getImageDataForNFT(fileType)

    let metadata = {
      owner: koi.address,
      name: 'koi nft',
      description: 'first koi nft',
      ticker: 'KOINFT'
    }

    metadata.title = content.title
    metadata.name = content.owner
    metadata.description = content.description
    metadata.owner = koi.address
    metadata.ticker = 'KOINFT'

    const balances = {}
    balances[metadata.owner] = 1

    let d = new Date()
    let createdAt = Math.floor(d.getTime()/1000).toString()
    const initialState = {
      'owner': metadata.owner,
      'title': metadata.title,
      'name': metadata.name,
      'description': metadata.description,
      'ticker': metadata.ticker,
      'balances': balances,
      'contentType': fileType,
      'createdAt': createdAt,
      'tags': tags
    }

    let tx
    
    tx = await arweave.createTransaction({
      data: u8
    })

    tx.addTag('Content-Type', fileType)
    tx.addTag('Network', 'Koi')
    tx.addTag('Action', 'marketplace/Create')
    tx.addTag('App-Name', 'SmartWeaveContract')
    tx.addTag('App-Version', '0.3.0')
    tx.addTag('Contract-Src', 'I8xgq3361qpR8_DvqcGpkCYAUTMktyAgvkm6kGhJzEQ')
    tx.addTag('Init-State', JSON.stringify(initialState))

    try {
      await arweave.transactions.sign(tx, koi.wallet)
    } catch (err) {
      console.log('transaction sign error')
      console.log('err-sign', err)
      throw new Error(err.message)
    }
    console.log(tx)

    const registrationData = await getRegistrationReward(koi, tx.id)
    console.log('REGISTER REWARD: ', registrationData)

    let uploader = await arweave.transactions.getUploader(tx)
    console.log('uploader', uploader)
    
    // Upload progress

    while (!uploader.isComplete) {
      await uploader.uploadChunk()
      console.log(
        uploader.pctComplete + '% complete',
        uploader.uploadedChunks + '/' + uploader.totalChunks
      )
    }

    try {
      initialState.tx = tx
      initialState.registerDataParams = { id : tx.id, ownerAddress: koi.address }
      const formData  = new FormData()
      formData.append('file', file)
      formData.append('data', JSON.stringify(initialState))
      const rawResponse = await fetch(`${bundlerUrl}/handleNFTUpload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      })
      const response = await rawResponse.json()
      let resTx = await koi.registerData(tx.id, koi.address, koi.wallet, arweave)
      console.log('Transaction id', tx.id)
      return { txId: tx.id, time: createdAt }
    } catch(err) {
      console.log('err-@_koi/sdk', err)
      throw new Error('Upload failed.')
    }
  } catch(err) {
    console.log(err.message)
    throw new Error(err.message)
  }
}

export const createNewKid = async (koi, kidInfo, fileType) => {
  const { u8 } = await getImageDataForNFT(fileType)
  const image = { blobData: u8, contentType: fileType }

  const txId = await koi.createKID(kidInfo, image)
  return txId
}

export const updateKid = async (koi, kidInfo, contractId) => {
  return await koi.updateKID(kidInfo, contractId)
}

export const utils = {
  loadWallet,
  setChromeStorage,
  getChromeStorage,
  removeChromeStorage
}
