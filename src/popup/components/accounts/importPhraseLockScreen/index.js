import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'

import InputField from 'shared/inputField'
import TextAreaField from 'shared/textAreaField'
import Button from 'shared/button'
import { importWallet } from 'actions/koi'
import { setError } from 'actions/error'
import { PATH, ERROR_MESSAGE } from 'constants'

import './index.css'
import Header from 'shared/header'

const ImportPhrase = ({ setError, importWallet }) => {
  const history = useHistory()
  const [phrase, setPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const onPhraseChange = (e) => {
    setPhrase(e.target.value)
  }

  const onPasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
  }

  const onSubmit = async () => {
    try {
      if (phrase.split(' ').length != 12) {
        setError(ERROR_MESSAGE.INCORRECT_PHRASE)
      } else if (password.length < 8) {
        setError(ERROR_MESSAGE.PASSWORD_LENGTH)
      } else if (password !== confirmPassword) {
        setError(ERROR_MESSAGE.PASSWORD_MATCH)
      } else {
        const redirectPath = PATH.IMPORT_KEY_REDIRECT
        importWallet({ data: phrase, password, history, redirectPath })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className='seed-phrase-lock-screen'>
      <Header />
      <div className='content'>
        <div className='welcome'>Welcome</div>
        <TextAreaField
          type='password'
          className='seed-phrase field'
          name='inputPhrase'
          label='Paste your seed phrase'
          value={phrase}
          onChange={onPhraseChange}
        />
        <InputField
          className='password field'
          name='password'
          type='password'
          label='password'
          placeholder='Make it unique (min. 8 characters)'
          value={password}
          onChange={onPasswordChange}
        />
        <InputField
          className='confirm-password field'
          name='confirm-password'
          type='password'
          label='Confirm password'
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
        />
        <Button className='unlock-button' label='Unlock' onClick={onSubmit} />
        <div className='login-with-password'>
          Log in with my{' '}
          <Link className='password-link' to='/account/login'>
            password
          </Link>
        </div>
      </div>
    </div>
  )
}

export default connect(null, { setError, importWallet })(ImportPhrase)
