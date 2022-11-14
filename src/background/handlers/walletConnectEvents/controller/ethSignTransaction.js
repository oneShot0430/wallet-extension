// Constants
import { OS, REQUEST, WINDOW_SIZE } from 'constants/koiConstants'
import { get, isEmpty } from 'lodash'
import { backgroundAccount } from 'services/account'
import storage from 'services/storage'
// Utils
import { createWindow } from 'utils/extension'
import { v4 as uuid } from 'uuid'
import Web3 from 'web3'


export default async (payload, metadata, next) => {
  try {
    console.log('eth sign transaction')
    console.log('payload', payload)
    console.log('metadata', metadata)

    const exampleTransactionData = '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331'
    /* TODO walletconnect: Implement sign transaction */
    next({ data: exampleTransactionData })
  } catch (err) {
    next({ error: err.message })
  }
}
