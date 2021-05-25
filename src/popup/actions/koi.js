import { get } from 'lodash'

import { setIsLoading } from './loading'
import { setContLoading } from './continueLoading'
import { setError } from './error'
import { setCreateWallet } from './createWallet'
import { setAssets } from './assets'
import { setActivities } from './activities'
import { setTransactions } from './transactions'

import backgroundConnect, { CreateEventHandler } from './backgroundConnect'

import { MESSAGES, PATH, STORAGE, REQUEST, NOTIFICATION } from 'constants'

import { SET_KOI } from 'actions/types'
import { getChromeStorage, removeChromeStorage } from 'utils'
import { setNotification } from './notification'

export const importWallet = (inputData) => (dispatch) => {
  try {
    dispatch(setIsLoading(true))
    const { history, redirectPath } = inputData
    const importSuccessHandler = new CreateEventHandler(MESSAGES.IMPORT_WALLET_SUCCESS, async response => {
      const { koiData } = response.data
      dispatch(setKoi(koiData))
      await removeChromeStorage(STORAGE.SITE_PERMISSION)
      await removeChromeStorage(STORAGE.PENDING_REQUEST)
      await removeChromeStorage(STORAGE.CONTENT_LIST)
      await removeChromeStorage(STORAGE.ACTIVITIES_LIST)
      dispatch(setIsLoading(false))
      history.push(redirectPath)
    })
    const importFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(importSuccessHandler)
    backgroundConnect.addHandler(importFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.IMPORT_WALLET,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const loadWallet = (inputData) => (dispatch) => {
  try {
    dispatch(setIsLoading(true))
    const loadSuccessHandler = new CreateEventHandler(MESSAGES.LOAD_WALLET_SUCCESS, response => {
      const { koiData } = response.data
      dispatch(setKoi(koiData))
      dispatch(setIsLoading(false))
    })
    const loadFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(loadSuccessHandler)
    backgroundConnect.addHandler(loadFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.LOAD_WALLET,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const removeWallet = (inputData) => (dispatch) => {
  try {
    const { history } = inputData
    dispatch(setIsLoading(true))
    const removeSuccessHandler = new CreateEventHandler(MESSAGES.REMOVE_WALLET_SUCCESS, response => {
      const { koiData } = response.data
      dispatch(setAssets([]))
      dispatch(setKoi(koiData))
      dispatch(setIsLoading(false))
      history.push('/account/welcome')
    })
    const removeFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(removeSuccessHandler)
    backgroundConnect.addHandler(removeFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.REMOVE_WALLET
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const lockWallet = (inputData) => (dispatch) => {
  try {
    const { history } = inputData
    dispatch(setIsLoading(true))
    const lockSuccessHandler = new CreateEventHandler(MESSAGES.LOCK_WALLET_SUCCESS, response => {
      dispatch(setKoi({
        koiBalance: null,
        arBalance: null,
        address: null
      }))
      dispatch(setIsLoading(false))
      history.push(PATH.LOGIN)
    })
    const lockFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(lockSuccessHandler)
    backgroundConnect.addHandler(lockFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.LOCK_WALLET
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const unlockWallet = (inputData) => (dispatch) => {
  try {
    const { history } = inputData
    dispatch(setIsLoading(true))
    const unlockSuccessHandler = new CreateEventHandler(MESSAGES.UNLOCK_WALLET_SUCCESS, async response => {
      const { koiData } = response.data
      dispatch(setKoi(koiData))
      dispatch(setIsLoading(false))
      const storage = await getChromeStorage(STORAGE.PENDING_REQUEST)
      /* istanbul ignore next */
      switch (get(storage[STORAGE.PENDING_REQUEST], 'type')) {
        case REQUEST.PERMISSION:
          history.push('/account/connect-site')
          break
        case REQUEST.TRANSACTION:
          history.push('/account/sign-transaction')
          break
        default:
          history.push('/account')
      }
    })
    const unlockFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(unlockSuccessHandler)
    backgroundConnect.addHandler(unlockFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.UNLOCK_WALLET,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const generateWallet = (inputData) => (dispatch) => {
  try {
    const { stage, password } = inputData

    dispatch(setIsLoading(true))
    const generateSuccessHandler = new CreateEventHandler(MESSAGES.GENERATE_WALLET_SUCCESS, response => {
      const { seedPhrase } = response.data
      dispatch(setCreateWallet({ seedPhrase, stage, password }))
      dispatch(setIsLoading(false))
    })
    const generateFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(generateSuccessHandler)
    backgroundConnect.addHandler(generateFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.GENERATE_WALLET,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const saveWallet = (inputData) => (dispatch) => {
  try {
    const { history } = inputData
    dispatch(setIsLoading(true))
    const saveSuccessHandler = new CreateEventHandler(MESSAGES.SAVE_WALLET_SUCCESS, response => {
      const { koiData } = response.data
      dispatch(setKoi(koiData))
      dispatch(setIsLoading(false))
      setCreateWallet({ stage: 1, password: null, seedPhrase: null })
      history.push(PATH.HOME)
    })
    const saveFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(saveSuccessHandler)
    backgroundConnect.addHandler(saveFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.SAVE_WALLET,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const loadContent = () => (dispatch) => {
  try {
    dispatch(setContLoading(true))
    const loadSuccessHandler = new CreateEventHandler(MESSAGES.LOAD_CONTENT_SUCCESS, response => {
      const { contentList } = response.data
      console.log('CONTENT LIST FROM ACTION', contentList)
      dispatch(setAssets(contentList))
      dispatch(setContLoading(false))
    })
    const loadFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setContLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(loadSuccessHandler)
    backgroundConnect.addHandler(loadFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.LOAD_CONTENT,
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setContLoading(false))
  }
}

export const loadActivities = () => (dispatch) => {
  try {
    console.log('LOAD ACTIVITIES ACTION')
    dispatch(setContLoading(true))
    const loadSuccessHandler = new CreateEventHandler(MESSAGES.LOAD_ACTIVITIES_SUCCESS, response => {
      const { activitiesList } = response.data
      console.log('ACTIVITIES LIST ACTION', activitiesList)
      dispatch(setActivities(activitiesList))
      dispatch(setContLoading(false))
    })
    const loadFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setContLoading(false))
      dispatch(setError(errorMessage))
    })

    backgroundConnect.addHandler(loadSuccessHandler)
    backgroundConnect.addHandler(loadFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.LOAD_ACTIVITIES,
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setContLoading(false))
  }
}

export const makeTransfer = (inputData) => (dispatch) => {
  try {
    dispatch(setIsLoading(true))
    const transferSuccessHandler = new CreateEventHandler(MESSAGES.MAKE_TRANSFER_SUCCESS, response => {
      const { txId } = response.data
      dispatch(setTransactions(txId))
      dispatch(setIsLoading(false))
      dispatch(setNotification(`Transaction ID: ${txId}`))
    })
    const transferFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
    })
    backgroundConnect.addHandler(transferSuccessHandler)
    backgroundConnect.addHandler(transferFailedHandler)
    backgroundConnect.postMessage({
      type: MESSAGES.MAKE_TRANSFER,
      data: inputData
    })
  } catch (err) {
    dispatch(setError(err.message))
    dispatch(setIsLoading(false))
  }
}

export const signTransaction = (inputData) => (dispatch) => {
  try {
    console.log('SIGN TRANSACTION ACTION')
    dispatch(setIsLoading(true))
    const signSuccessHandler = new CreateEventHandler(MESSAGES.SIGN_TRANSACTION_SUCCESS, response => {
      console.log('SIGN TRANSACTION SUCCESS')
      dispatch(setIsLoading(false))
    })
    const signFailedHandler = new CreateEventHandler(MESSAGES.ERROR, response => {
      console.log('=== BACKGROUND ERROR ===')
      const errorMessage = response.data
      dispatch(setIsLoading(false))
      dispatch(setError(errorMessage))
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

export const getKeyFile = () => (dispatch) => {
  const getKeyFileSuccessHandler = new CreateEventHandler(MESSAGES.GET_KEY_FILE_SUCCESS, response => {
    const content = response.data
    const filename = 'arweave-key.json'
    const result = JSON.stringify(content)

    const url = 'data:application/json;base64,' + btoa(result)
    chrome.downloads.download({
      url: url,
      filename: filename,
    })
    dispatch(setNotification(NOTIFICATION.KEY_EXPORTED))
  })
  backgroundConnect.addHandler(getKeyFileSuccessHandler)
  backgroundConnect.postMessage({
    type: MESSAGES.GET_KEY_FILE,
    data: {}
  })
}

export const setKoi = (payload) => ({ type: SET_KOI, payload })
