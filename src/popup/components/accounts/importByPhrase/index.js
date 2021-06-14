import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import './index.css'
import ImportIcon from 'img/import-icon.svg'
import Card from 'shared/card'
import InputField from 'shared/inputField'
import CreatePassword from 'shared/createPassword'

import { importWallet } from 'actions/koi'
import { setError } from 'actions/error'

import { PATH, ERROR_MESSAGE } from 'koiConstants'

export const ImportByPhrase = ({ importWallet, setError }) => {
  const history = useHistory()
  const [phrase, setPharse] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isAccept, setIsAccept] = useState(false)

  const onPhraseChange = (e) => {
    setPharse(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      if (!phrase) {
        setError(ERROR_MESSAGE.EMPTY_PHRASE)
      } else if (password.length < 8) {
        setError(ERROR_MESSAGE.PASSWORD_LENGTH)
      } else if (password !== confirmPassword) {
        setError(ERROR_MESSAGE.PASSWORD_MATCH)
      } else if (!isAccept) {
        setError(ERROR_MESSAGE.CHECKED_TERMS)
      } else {
        const redirectPath = PATH.IMPORT_PHRASE_REDIRECT
        importWallet({ data: phrase, password, history, redirectPath })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="account-import-phrase">
      <Card className="import-phrase">
        <div className="title">
          <ImportIcon />
          <p>Import a wallet</p>
        </div>
        <form onSubmit={handleSubmit}>
          <InputField name="inputPhrase" label="12-word seed phrase" onChange={onPhraseChange} placeholder="Paste seed phrase here" />
          <CreatePassword 
            isEnable={!isEmpty(phrase) } 
            setPassword={setPassword} 
            setConfirmPassword={setConfirmPassword} 
            setIsAccept={setIsAccept} 
          />
        </form>
      </Card>
    </div>
  )
}

const mapStateToProps = (state) => ({ isLoading: state.loading })

export default connect(mapStateToProps, { importWallet, setError })(ImportByPhrase)
