import { 
  ADD_ACCOUNT_BY_ADDRESS, 
  SET_ACCOUNTS,
  SET_DEFAULT_ACCOUNT 
} from './types'
import actionHelpers from './helpers'

import { popupAccount } from 'services/account'
import storage from 'services/storage'

import { setDefaultAccountByAddress } from './defaultAccount'

export const loadAllAccounts = () => async (dispatch) => {
  await popupAccount.loadImported()
  const allAccounts = await popupAccount.getAllMetadata()
  await dispatch(setAccounts(allAccounts))

  return allAccounts
}

export const setAccounts = (accounts) => async (dispatch) => {
  const defaultAccountAddress = await storage.setting.get.activatedAccountAddress()
  dispatch(setDefaultAccountByAddress(defaultAccountAddress))

  return dispatch({
    type: SET_ACCOUNTS,
    payload: accounts,
  })
}

export const addAccountByAddress = (address) => async (dispatch) => {
  const account = await popupAccount.getAccount({
    address,
  })
  const accountMetaData = await account.get.metadata()

  return dispatch({
    type: ADD_ACCOUNT_BY_ADDRESS,
    payload: accountMetaData,
  })
}

export const loadAllFriendReferralData = () => async (dispatch) => {
  await actionHelpers.loadFriendReferralData()
  dispatch(loadAllAccounts())
}