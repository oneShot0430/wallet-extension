// modules
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Route, Switch, useHistory, withRouter } from 'react-router-dom'
import { setAccounts } from 'actions/accounts'
import { setActivatedChain } from 'actions/activatedChain'
import { setActivities } from 'actions/activities'
import { setActivityNotifications } from 'actions/activityNotification'
import { setAssetsTabSettings } from 'actions/assetsSettings'
import { setCurrency } from 'actions/currency'
import { setDefaultAccount } from 'actions/defaultAccount'
import { setError } from 'actions/error'
// actions
import { lockWallet } from 'actions/koi'
import { getBalances, setKoi } from 'actions/koi'
import { setIsLoading } from 'actions/loading'
import { setNotification } from 'actions/notification'
import { setPrice } from 'actions/price'
import { setSettings } from 'actions/settings'
import { setWarning } from 'actions/warning'
import { MESSAGES } from 'constants/koiConstants'
// assets
import continueLoadingIcon from 'img/continue-load.gif'
import isEmpty from 'lodash/isEmpty'
import { popupAccount } from 'services/account'
import { popupBackgroundConnect } from 'services/request/popup'
import { EventHandler } from 'services/request/src/backgroundConnect'

import Account from 'components/accounts'
import ConnectScreen from 'components/Connect/ConnectScreen'
import Loading from 'components/loading'
import Message from 'components/message'
import ConnectedSitesModal from 'components/modals/connectedSitesModal'
// components
// import Header from 'components/header'
import Header from 'components/PopupHeader'
import EthSign from 'components/sign/EthSign'
import GetEncryptionKey from 'components/sign/GetEncryptionKey'
import SignTypedDataV1 from 'components/sign/SignTypedDataV1'
import SignTypedDataV3 from 'components/sign/SignTypedDataV3'
import SignModal from 'components/SignTransaction'

import NavBar from './components/NavBar'
// pages
import Home from './pages/Home'
import ImportToken from './pages/ImportToken'
import Login from './pages/Login'
import Receive from './pages/Receive'
import Send from './pages/SendNew'
// hooks
import useLoadApp from './provider/hooks/useLoadApp'
import useMethod from './provider/hooks/useMethod'
import usePrice from './provider/hooks/usePrice'
import useSettings from './provider/hooks/useSettings'
import useTimeInterval from './provider/hooks/useTimeInterval'

// styles
import './Popup.css'

const ContinueLoading = () => (
  <div className="continue-loading">
    <img src={continueLoadingIcon} />
  </div>
)

/* 
  Finnie supports multiple chains.
  Each chain has it's default account.
*/
const Popup = ({
  lockWallet,
  location,
  isLoading,
  isContLoading,
  setIsLoading,
  error,
  setError,
  notification,
  setNotification,
  warning,
  setPrice,
  setCurrency,
  setAccounts,
  setDefaultAccount,
  setActivatedChain,
  accounts,
  setActivityNotifications,
  setSettings,
  setAssetsTabSettings
}) => {
  const history = useHistory()

  usePrice({
    setCurrency,
    setPrice,
    setError
  })

  useSettings({ setSettings, setAssetsTabSettings, setError })

  const {
    showConnectSite,
    showSigning,
    setShowSigning,
    showEthSign,
    showSignTypedDataV1,
    showSignTypedDataV3,
    showGetEncryptionKey,
    accountLoaded,
    showConnectedSites,
    setShowConnectedSites,
    loadDefaultAccounts
  } = useLoadApp({
    history,
    setDefaultAccount,
    setActivityNotifications,
    setError,
    setIsLoading,
    setActivatedChain,
    setAccounts,
    accounts,
    lockWallet
  })

  const { handleLockWallet } = useMethod({ accounts, setIsLoading, lockWallet })

  useTimeInterval({ error, notification, warning, setError })

  useEffect(() => {
    const addHandler = () => {
      const loadBalancesSuccess = new EventHandler(MESSAGES.GET_BALANCES_SUCCESS, async () => {
        try {
          const accountStates = await popupAccount.getAllMetadata()
          setAccounts(accountStates)
          loadDefaultAccounts()
        } catch (err) {
          console.error('Reload balance error: ', err)
        }
      })
      popupBackgroundConnect.addHandler(loadBalancesSuccess)
    }

    addHandler()
  }, [])

  console.log('isLoading', isLoading)

  return (
    <div className="popup">
      <div className="h-full">
        {showEthSign && <EthSign />}
        {showSignTypedDataV1 && <SignTypedDataV1 />}
        {showSignTypedDataV3 && <SignTypedDataV3 />}
        {showGetEncryptionKey && <GetEncryptionKey />}
        {showConnectSite && <ConnectScreen />}
        {showConnectedSites && <ConnectedSitesModal onClose={() => setShowConnectedSites(false)} />}
        {showSigning && <SignModal setShowSigning={setShowSigning} />}
        {isContLoading && location.pathname === '/assets' && <ContinueLoading />}
        {isLoading !== 0 && <Loading />}
        {error && <Message type="error" children={error} />}
        {notification && <Message type="notification" children={notification} />}
        {warning && <Message type="warning" children={warning} />}

        {accountLoaded && (
          <Switch>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/account/*">
              <Account />
            </Route>
            {!isEmpty(accounts) && (
              <>
                <Header setShowConnectedSites={setShowConnectedSites} />
                <div
                  className="flex min-h-3.375 pt-13.5 overflow-y-auto overflow-x-hidden"
                  style={{ height: 'calc(100% - 64px)' }}
                >
                  <Switch>
                    <Route exact path="/receive">
                      <Receive />
                    </Route>
                    <Route exact path="/send">
                      <Send setShowSigning={setShowSigning} />
                    </Route>
                    <Route path="/import-token">
                      <ImportToken />
                    </Route>
                    <Route path="*">
                      <Home />
                    </Route>
                  </Switch>
                </div>
                <NavBar handleLockWallet={handleLockWallet} />
              </>
            )}
          </Switch>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  isLoading: state.loading,
  error: state.error,
  notification: state.notification,
  warning: state.warning,
  koi: state.koi,
  transactions: state.transactions,
  isContLoading: state.contLoading,
  price: state.price,
  accounts: state.accounts,
  activityNotifications: state.activityNotifications,
  activities: state.activities
})

const mapDispatchToProps = {
  lockWallet,
  setIsLoading,
  setError,
  setNotification,
  setWarning,
  setKoi,
  getBalances,
  setPrice,
  setCurrency,
  setAccounts,
  setDefaultAccount,
  setActivatedChain,
  setActivityNotifications,
  setSettings,
  setActivities,
  setAssetsTabSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Popup))
