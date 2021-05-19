import React, { useState} from 'react'
import { connect } from 'react-redux'

import InputField from 'shared/inputField/index'
import Button from 'shared/button/index'

import WarningIcon from 'img/warning-icon.svg'

import { setError } from 'actions/error'
import { ERROR_MESSAGE } from 'constants'

import './index.css'

const SendKoiForm = ({ koiBalance, rate, hanldeTransaction, setError }) => {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')

  const onChangeAddress = (e) => {
    setAddress(e.target.value)
  }
  const onChangeAmount = (e) => {
    setAmount(e.target.value)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    try {
      if (!(address.length > 0 && amount.length >0)) {
        setError(ERROR_MESSAGE.EMPTY_FIELDS)
      } else {
        setAddress('')
        setAmount('')
        await hanldeTransaction()
        alert('Sent!')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const numberFormat = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <form className="send-koi-form" onSubmit={handleSubmitForm}>
      <div className="koi-balance">
        <span>Available balance: </span>
        <b>{koiBalance} KOI</b>
        <div className="amount-in-usd">~ $ {numberFormat(koiBalance*rate)} USD</div>
      </div>
      <div className="recipient">
        <InputField
          label="To"
          placeholder="Recipient’s wallet address"
          className="form-input"
          type="text"
          onChange={onChangeAddress}
          value={address}
        />
      </div>
      <div className="warning">
        <div className="warning-icon">
          <WarningIcon />
        </div>
        <div className="warning-message">
          Make sure you have the correct wallet address. There is no way to
          reverse the transaction.
        </div>
      </div>
      <div className="amount">
        <InputField
          label="Amount"
          placeholder="Amount of KOI to send"
          className="form-input"
          type="number"
          onChange={onChangeAmount}
          value={amount}
        />
        <div className="amount-in-usd">~ $ {numberFormat(Number(amount)*rate)} USD</div>
      </div>
      <Button label="Send KOI" className="send-button" />
    </form>
  )
}

export default connect(null, {setError})(SendKoiForm)