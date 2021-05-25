import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import GlobalButton from 'shared/globalButton/index'
import SendKoiForm from './sendKoiForm/index'

import PlusIcon from 'img/plus-icon.svg'
import { Link } from 'react-router-dom'
import './index.css'

import Wallet from './wallet/index'

import { RATE } from 'constants'

export const AccountHome = ({ koi }) => {
  const [showForm, setShowForm] = useState(false)
  const history = useHistory()

  useEffect(() => {
    return history.listen((location) => {
      const openSendForm = new URLSearchParams(location.search).get('openSendForm') === 'true'
      setShowForm(openSendForm)
    })
  }, [])

  const onSendSuccess = () => {
    setShowForm(false)
  }
  const onClickGlobalSendButton = () => {
    if (showForm) {
      history.replace('/account')
    } else {
      history.replace('/account?openSendForm=true')
    }
  }
  return (
    <div>
      {koi.address && <GlobalButton onClick={onClickGlobalSendButton} />}
      {showForm && <SendKoiForm
        koiBalance={koi.koiBalance}
        rate={RATE.KOI}
        onSendSuccess={onSendSuccess}
      />}
      {koi.address ? <Wallet accountAddress={koi.address} koiBalance={koi.koiBalance} arBalance={koi.arBalance} /> :
        <Link to='/account/import' className="plus-button">
          <PlusIcon />
        </Link>}
    </div>
  )
}

const mapStateToProps = (state) => ({ koi: state.koi })

export default connect(mapStateToProps)(AccountHome)
