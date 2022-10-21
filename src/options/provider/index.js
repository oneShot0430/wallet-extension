import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactNotification from 'react-notifications-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { TYPE } from 'constants/accountConstants'
import { GALLERY_IMPORT_PATH } from 'constants/koiConstants'
import find from 'lodash/find'
import get from 'lodash/get'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import { loadAllAccounts, loadAllFriendReferralData } from 'options/actions/accounts'
import { setActivatedChain } from 'options/actions/activatedChain'
import { setAssets } from 'options/actions/assets'
import { setCollections } from 'options/actions/collections'
import { setDefaultAccount } from 'options/actions/defaultAccount'
import { clearError } from 'options/actions/error'
import { setIsLoading, setLoaded } from 'options/actions/loading'
import { setNotifications } from 'options/actions/notifications'
import { clearQuickNotification, setQuickNotification } from 'options/actions/quickNotification'
import { setWalletLoaded } from 'options/actions/walletLoaded'
import { DidContext } from 'options/context'
import LockScreen from 'options/finnie-v1/components/lockScreen'
import Message from 'options/finnie-v1/components/message'
import Onboarding from 'options/finnie-v2/pages/Onboarding/Onboarding'
import { GalleryContext } from 'options/galleryContext'
import ExportNFT from 'options/modal/exportNFT'
import SelectAccountModal from 'options/modal/SelectAccountModal'
import ShareNFT from 'options/modal/shareNFT'
import TransferNFT from 'options/modal/TransferNFT'
import Welcome from 'options/modal/welcomeScreen'
import { popupAccount } from 'services/account'
import { popupBackgroundRequest as backgroundRequest } from 'services/request/popup'
import storage from 'services/storage'

import useAddHandler from './hooks/useAddHandler'
import useDID from './hooks/useDID'
import useError from './hooks/useError'
import useModal from './hooks/useModal'
import { useNfts } from './hooks/useNfts'
import useSetting from './hooks/useSetting'

import 'react-notifications-component/dist/theme.css'
import './index.css'

export default ({ children }) => {
  const { pathname } = useLocation()

  /* 
    Local state
  */
  const [isLocked, setIsLocked] = useState(false)

  /* 
    GET STATE FROM STORE
  */
  const accounts = useSelector((state) => state.accounts)
  const assets = useSelector((state) => state.assets)
  const isOnboarding = useSelector((state) => state.onboarding.isOnboarding)
  const newAddress = useSelector((state) => state.newAddress)
  const walletLoaded = useSelector((state) => state.walletLoaded)

  const dispatch = useDispatch()

  /* HOOKS */
  const [error, setError] = useError()
  const [didStates, setDIDStates] = useDID({ newAddress, walletLoaded, setError })
  const [modalStates, setModalStates] = useModal()
  const [settingStates, setSettingStates] = useSetting({ walletLoaded })

  useAddHandler({ setError, setModalStates })
  useNfts({ setCollections, walletLoaded, newAddress, pathname })

  useEffect(() => {
    const loadActivatedChain = async () => {
      const activatedChainStorage = await storage.setting.get.activatedChain()
      if (activatedChainStorage) dispatch(setActivatedChain(activatedChainStorage))
    }

    loadActivatedChain()
  }, [])

  /* EDITING COLLECTION ID */
  const handleShareNFT = (txId) => {
    const toShareNFT = find(assets.nfts, { txId })
    setModalStates.setShowTransferNFT({ show: true, cardInfo: toShareNFT })
  }

  const refreshNFTs = async () => {
    let allAssets = await popupAccount.getAllAssets()
    let validAssets = allAssets.filter((asset) => asset.name !== '...')

    console.log('validAssets', validAssets.length)

    dispatch(setAssets({ nfts: validAssets }))
  }

  /* 
    STEP 1:
    - Load accounts from chrome storage
  */
  useEffect(() => {
    const loadWallets = async () => {
      dispatch(setIsLoading)
      const allAccounts = await dispatch(loadAllAccounts()) // will load default account also
      const _isLocked = await backgroundRequest.wallet.getLockState()

      dispatch(setWalletLoaded(true))
      // go to lock screen if having imported account
      if (!isEmpty(allAccounts)) {
        setIsLocked(_isLocked)
      }
      dispatch(setLoaded)
    }
    loadWallets()
  }, [])

  /*
    STEP 2: 
  */

  useEffect(() => {
    const getAffiliateCode = () => {
      dispatch(loadAllFriendReferralData())
    }

    const loadNotifications = async () => {
      const allNotifications = await storage.generic.get.pushNotification()
      console.log('all notificatoin =======', allNotifications)
      dispatch(setNotifications(allNotifications))
    }

    if (walletLoaded) {
      getAffiliateCode()
      loadNotifications()
    }
  }, [walletLoaded])

  /* 
    Reload wallets when a new wallet just imported
  */
  useEffect(() => {
    const updateAccounts = async () => {
      await popupAccount.loadImported()

      /* 
        Set default account if imported account is the first account
      */
      if (get(popupAccount, 'importedAccount.length') === 1) {
        let activatedAccountAddress = await storage.setting.get.activatedArweaveAccountAddress()
        if (!isEmpty(activatedAccountAddress)) {
          let activatedAccount = await popupAccount.getAccount({
            address: activatedAccountAddress
          })
          activatedAccount = await activatedAccount.get.metadata()
          dispatch(setDefaultAccount(activatedAccount))
        }

        let activatedEthereumAccountAddress = await storage.setting.get.activatedEthereumAccountAddress()
        if (!isEmpty(activatedEthereumAccountAddress)) {
          let activatedEthereumAccount = await popupAccount.getAccount({
            address: activatedEthereumAccountAddress
          })
          activatedEthereumAccount = await activatedEthereumAccount.get.metadata()
          dispatch(setDefaultAccount(activatedEthereumAccount))
        }

        let activatedSolanaAccountAddress = await storage.setting.get.activatedSolanaAccountAddress()
        if (!isEmpty(activatedSolanaAccountAddress)) {
          let activatedSolanaAccount = await popupAccount.getAccount({
            address: activatedSolanaAccountAddress
          })
          activatedSolanaAccount = await activatedSolanaAccount.get.metadata()
          dispatch(setDefaultAccount(activatedSolanaAccount))
        }

        let activatedK2AccountAddress = await storage.setting.get.activatedK2AccountAddress()
        if (!isEmpty(activatedK2AccountAddress)) {
          let activatedK2Account = await popupAccount.getAccount({
            address: activatedK2AccountAddress
          })
          activatedK2Account = await activatedK2Account.get.metadata()
          dispatch(setDefaultAccount(activatedK2Account))
        }
      }
    }

    const loadDID = async () => {
      backgroundRequest.gallery.getDID({ address: newAddress })
    }

    if (newAddress) {
      loadDID()
      updateAccounts()
      dispatch(loadAllFriendReferralData())
    }
  }, [newAddress])

  const updateDefaultAccountData = async () => {
    let activatedAccountAddress = await storage.setting.get.activatedArweaveAccountAddress()
    if (!isEmpty(activatedAccountAddress)) {
      let activatedAccount = await popupAccount.getAccount({
        address: activatedAccountAddress
      })
      activatedAccount = await activatedAccount.get.metadata()
      dispatch(setDefaultAccount(activatedAccount))
    }

    let activatedEthereumAccountAddress = await storage.setting.get.activatedEthereumAccountAddress()
    if (!isEmpty(activatedEthereumAccountAddress)) {
      let activatedEthereumAccount = await popupAccount.getAccount({
        address: activatedEthereumAccountAddress
      })
      activatedEthereumAccount = await activatedEthereumAccount.get.metadata()
      dispatch(setDefaultAccount(activatedEthereumAccount))
    }

    let activatedSolanaAccountAddress = await storage.setting.get.activatedSolanaAccountAddress()
    if (!isEmpty(activatedSolanaAccountAddress)) {
      let activatedSolanaAccount = await popupAccount.getAccount({
        address: activatedSolanaAccountAddress
      })
      activatedSolanaAccount = await activatedSolanaAccount.get.metadata()
      dispatch(setDefaultAccount(activatedSolanaAccount))
    }

    let activatedK2AccountAddress = await storage.setting.get.activatedK2AccountAddress()
    if (!isEmpty(activatedK2AccountAddress)) {
      let activatedK2Account = await popupAccount.getAccount({
        address: activatedK2AccountAddress
      })
      activatedK2Account = await activatedK2Account.get.metadata()
      dispatch(setDefaultAccount(activatedK2Account))
    }
  }

  useEffect(() => {
    updateDefaultAccountData()
  }, [])

  return (
    <GalleryContext.Provider
      value={{
        handleShareNFT,
        refreshNFTs,
        ...modalStates,
        ...setModalStates,
        ...settingStates,
        ...setSettingStates
      }}
    >
      <DidContext.Provider
        value={{
          ...didStates,
          ...setDIDStates
        }}
      >
        <div className="app-background">
          {!isEmpty(accounts) && !isOnboarding ? (
            <>
              {!isLocked ? (
                <div
                  onClick={(e) => {
                    if (e.target.className === 'modal-container') {
                      setModalStates.setShowShareModal(false)
                      setModalStates.setShowExportModal(false)
                      setSettingStates.setShowWelcome(false)
                    }
                  }}
                >
                  <Error />
                  <QuickNotification />

                  {modalStates.showShareModal.show && (
                    <ShareNFT
                      txid={modalStates.showShareModal.txid}
                      onClose={() => {
                        setModalStates.setShowShareModal({
                          ...modalStates.showShareModal,
                          show: false
                        })
                      }}
                    />
                  )}
                  {!isEmpty(modalStates.showExportModal) && (
                    <ExportNFT
                      info={modalStates.showExportModal}
                      onClose={() => {
                        setModalStates.setShowExportModal(false)
                      }}
                    />
                  )}

                  {modalStates.showTransferNFT.show && (
                    <TransferNFT
                      cardInfo={modalStates.showTransferNFT.cardInfo}
                      onClose={() => {
                        setModalStates.setShowTransferNFT({ show: false })
                      }}
                    />
                  )}

                  {settingStates.showWelcome && (
                    <Welcome
                      onClose={() => {
                        setSettingStates.setShowWelcome(false)
                      }}
                    />
                  )}
                  {modalStates.showSelectAccount && (
                    <SelectAccountModal
                      onClose={() => {
                        setModalStates.setShowSelectAccount(false)
                      }}
                    />
                  )}
                  {children}
                </div>
              ) : (
                <LockScreen />
              )}
            </>
          ) : (
            <>
              {walletLoaded && (
                <div>
                  <Error />
                  <Onboarding />
                </div>
              )}
            </>
          )}
        </div>
        <ReactNotification />
      </DidContext.Provider>
    </GalleryContext.Provider>
  )
}

const Error = () => {
  const dispatch = useDispatch()
  const error = useSelector((state) => state.error)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError), 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (error) return <Message children={error} />
  return ''
}

const QuickNotification = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const quickNotification = useSelector((state) => state.quickNotification)

  const isImportWalletPath = includes(GALLERY_IMPORT_PATH, pathname)

  useEffect(() => {
    if (quickNotification) {
      const timer = setTimeout(() => dispatch(clearQuickNotification), 4000)
      return () => clearTimeout(timer)
    }
  }, [quickNotification])

  if (quickNotification && !isImportWalletPath)
    return <Message children={quickNotification} type="notification" />
  return ''
}
