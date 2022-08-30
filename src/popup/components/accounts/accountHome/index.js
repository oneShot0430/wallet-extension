// modules
import React, { useEffect,useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
// actions
import { getBalances } from 'actions/koi'
// constants
import { RATE } from 'constants/koiConstants'
// assets
import PlusIcon from 'img/plus-icon.svg'
import Button from 'shared/button'
// components
import GlobalButton from 'shared/globalButton'

import SendKoiForm from './sendKoiForm'
import Wallet from './wallet'

// styles
import './index.css'

export const AccountHome = ({ getBalances, accounts }) => {
  let currencies = []
  for (const [key, _] of Object.entries(RATE)) {
    currencies.push({ label: key, value: key, id: key })
  }

  const defaultCurrency = currencies[0].value

  const [showForm, setShowForm] = useState(false)
  const [currency, setCurrency] = useState(defaultCurrency)
  const history = useHistory()

  useEffect(() => {
    return history.listen((location) => {
      const openSendForm =
        new URLSearchParams(location.search).get('openSendForm') === 'true'
      setShowForm(openSendForm)
      if (!openSendForm) {
        setCurrency(defaultCurrency)
      }
    })
  }, [])

  const onClickGlobalSendButton = () => {
    if (showForm) {
      setCurrency(defaultCurrency)
      history.replace('/account')
    } else {
      history.replace('/account?openSendForm=true')
    }
  }

  const onAddAccount = () => {
    history.push('/account/welcome')
  }

  const goToGallery = () => {
    const url = chrome.extension.getURL('options.html')
    chrome.tabs.create({ url })
  }

  return (
    <div>
      <GlobalButton onClick={onClickGlobalSendButton} currency={currency} />
      {showForm && <SendKoiForm />}
      <div className="accounts-wrapper">
        {accounts.map((account, index) => (
          <Wallet key={index} account={account} />
        ))}
      </div>
      <div
        onClick={onAddAccount}
        className={`home-plus-button-wrapper ${
          accounts.length % 2 === 0 ? 'white' : ''
        }`}
      >
        <div className="button">
          <PlusIcon />
        </div>
      </div>
      <div className={'home-gallery-button-wrapper'}>
        <div onClick={goToGallery} className="gallery-button">
          Go to My Gallery
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
})

export default connect(mapStateToProps, { getBalances })(AccountHome)
