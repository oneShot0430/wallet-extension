// modules
import { get } from 'lodash'

// actions
import { setIsLoading } from './loading'
import { setError } from './error'
import { setCreateWallet } from './createWallet'
import { setAssets } from './assets'
import { setActivities } from './activities'
import { setAccounts } from './accounts'

// constants
import { MESSAGES, FILENAME } from 'constants/koiConstants'
import { TYPE } from 'constants/accountConstants'
import { SET_KOI } from 'actions/types'

// services
import { popupBackgroundRequest as backgroundRequest, popupBackgroundConnect as backgroundConnect } from 'services/request'
import { popupAccount } from 'services/account'
import { EventHandler as CreateEventHandler } from 'services/request/backgroundConnect'

export const getBalances = () => async (dispatch) => {
  const getBalanceSuccessHandler = new CreateEventHandler(MESSAGES.GET_BALANCES_SUCCESS, async response => {
    try { 
      const accountStates = await popupAccount.getAllMetadata()
      dispatch(setAccounts(accountStates))
    } catch (err) {
      console.log(err.message)
      dispatch(setError(err.message))
    }
  })
  backgroundConnect.addHandler(getBalanceSuccessHandler)
  backgroundConnect.postMessage({
    type: MESSAGES.GET_BALANCES,
  })
}

/**
 * @param {String} key Wallet key or Seed phrase
 * @param {String} password Input password
 * @param {String} type Wallet type from constants/accountConstants
 * @returns {Void}
 */
export const importWallet = (key, password, type) => async (dispatch) => {
  try {
    await backgroundRequest.wallet.importWallet({key, password, type})
    await popupAccount.loadImported()
    const accountsData = await popupAccount.getAllMetadata()

    dispatch(setAccounts(accountsData))
    dispatch(getBalances())
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const removeWallet = (address) => async (dispatch, getState) => {
  try {
    await backgroundRequest.wallet.removeWallet({ address })

    await popupAccount.loadImported() // update accounts list for popupAccount
    const accountStates = await popupAccount.getAllMetadata()
    console.log('accountStates: ', accountStates)

    const { activities } = getState()
    const newActivities = activities.filter(activity => activity.address !== address)

    dispatch(setActivities(newActivities))
    dispatch(setAccounts(accountStates))
  } catch (err) {
    dispatch(setError(err.message))
  }
}


export const lockWallet = () => async (dispatch) => {
  try {
    await backgroundRequest.wallet.lockWallet()
  } catch (err) {
    dispatch(setError(err.message))
  }
}


export const unlockWallet = (password) => async (dispatch) => {
  try {
    await backgroundRequest.wallet.unlockWallet({ password })
    dispatch(getBalances())
    return true
  } catch (err) {
    dispatch(setError(err.message))
    return
  }
}

/*
  Stage 1 of creating new wallet. Generate new seed phrase.
*/
export const generateWallet = (inputData) => async (dispatch) => {
  try {
    const { stage, password, walletType } = inputData

    dispatch(setIsLoading(true))

    const { seedPhrase } = await backgroundRequest.wallet.generateWallet({ walletType, password })
    dispatch(setCreateWallet({ seedPhrase, stage, password }))
  } catch (err) {
    dispatch(setError(err.message))
  }
}

/*
  Stage 3 of creating new wallet. Save wallet data to chrome storage:
    - Encrypted password
    - Encrypted seed phrase
    - Address
  Get balances.
*/
export const saveWallet = (seedPhrase, password, walletType) => async (dispatch) => {
  try {
    await backgroundRequest.wallet.saveWallet({seedPhrase, password, walletType})
    const allData = await popupAccount.getAllMetadata()
    dispatch(setAccounts(allData))
    dispatch(setIsLoading(false))

    /* 
      Need to handle saving encrypted seedphrase
    */

    setCreateWallet({ stage: 1, password: null, seedPhrase: null })
    // We will move setCreateWallet() to the UI since now we can await for the action from UI code.
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const loadContent = () => async (dispatch) => {
  try {
    await backgroundRequest.assets.loadContent()

    const allAssets = []

    // update state
    const allAccounts = await popupAccount.getAllAccounts()
    await Promise.all(allAccounts.map(async (account) => {
      const assets = await account.get.assets() || []
      const address = await account.get.address()

      const accountAssets = { owner: address, contents: assets }

      allAssets.push(accountAssets)
    }))
    dispatch(setAssets(allAssets))
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const loadActivities = (cursor, address) => async (dispatch, getState) => {
  /*
    the sdk will require cursors for the next request if we want to receive next set of activities (pagination).
  */
  try {
    let { activitiesList,
      nextOwnedCursor: ownedCursor, 
      nextRecipientCursor: recipientCursor } = await backgroundRequest.activities.loadActivities({ cursor, address })

    const account = await popupAccount.getAccount({ address })
    const accountName = await account.get.accountName()

    activitiesList = activitiesList.map(activity => ({ ...activity, accountName }))

    const { activities } = getState()
    const newActivities = activities.map(activity => {
      if (get(activity, 'account.address') == address) {
        activity.activityItems = [...activity.activityItems, ...activitiesList]
        const doneLoading = !activitiesList.length
        activity.cursor = { ownedCursor, recipientCursor, doneLoading }
      }

      return activity
    })

    console.log('New Activities: ', newActivities)

    dispatch(setActivities(newActivities))
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const makeTransfer = (sender, qty, target, token) => async (dispatch) => {
  try {
    const { address } = sender

    if (token == 'KOII') token = 'KOI' // On the SDK the name of token KOII has not been updated. (still KOI) 
    const { txId } = await backgroundRequest.wallet.makeTransfer({qty, target, token, address})

    console.log('TRANSACTION ID', txId)
  } catch (err) {
    console.log('ERROR-ACTION: ', err.message)
    throw new Error(err.message)
  }
}

export const signTransaction = (inputData) => (dispatch) => {
  try {
    dispatch(setIsLoading(true))
    const signSuccessHandler = new CreateEventHandler(MESSAGES.SIGN_TRANSACTION_SUCCESS, response => {
      dispatch(setIsLoading(false))
      window.close()
    })
    const signFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
      window.close()
    })
    backgroundConnect.addHandler(signSuccessHandler)
    backgroundConnect.addHandler(signFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.SIGN_TRANSACTION,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const getKeyFile = (password, address) => async (dispatch) => {
  try {
    let { key } = await backgroundRequest.wallet.getKeyFile({ password, address })
    const type = await popupAccount.getType(address)

    let filename
    switch(type) {
      case TYPE.ARWEAVE:
        filename = FILENAME.ARWEAVE
        break
      case TYPE.ETHEREUM:
        filename = FILENAME.ETHEREUM
    }

    const result = JSON.stringify(key)

    const url = 'data:application/json;base64,' + btoa(result)
    chrome.downloads.download({
      url: url,
      filename: filename,
    })
  } catch (err) {
    throw new Error(err.message)
  }
}

export const connectSite = (inputData) => (dispatch) => {
  try {
    const connectSuccessHandler = new CreateEventHandler(MESSAGES.CONNECT_SUCCESS, response => {
      window.close()
    })
    const connectFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR 1===')
      const errorMessage = response.data
      dispatch(setError(errorMessage))
      window.close()
    })
    backgroundConnect.addHandler(connectSuccessHandler)
    backgroundConnect.addHandler(connectFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.CONNECT,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const changeAccountName = (address, newName) => async (dispatch) => {
  try {
    await backgroundRequest.wallet.changeAccountName({ address, newName })

    const allData = await popupAccount.getAllMetadata()
    dispatch(setAccounts(allData))
  } catch (err) {
    dispatch(setError(err.message))
  }
}

export const setKoi = (payload) => ({ type: SET_KOI, payload })
