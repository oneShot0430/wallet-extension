// modules
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
// actions
import { setError } from 'actions/error'
// constants
import { ERROR_MESSAGE, STORAGE } from 'constants/koiConstants'
// assets
import WarningIcon from 'img/warning-icon.svg'
import Button from 'popup/components/shared/button'
import Input from 'popup/components/shared/inputField'
// components
import Modal from 'popup/components/shared/modal'
// services
import { popupAccount } from 'services/account'

// styles
import './index.css'

const NoSeedphrase = ({onClose}) => (
  <div>
    <div className='modal-title'>
      Reveal Seed Phrase
    </div>
    <div className='modal-description'> 
      This key does not have a secret phrase. If you have a secret phrase for this key, please import it again using the secret phrase.<br/>
      Note: secret phrases must be generated at the same time as the key.
    </div>
    <div className='modal-button-no-seedphrase'>
      <Button label='Got it' type='outline' onClick={onClose} className='modal-action-button close'/>
    </div>
  </div>
)

export const RevealSeedPhraseModal = ({ onReveal, onClose, setError, account }) => {
  const [password, setPassword] = useState('')
  const [hasSeedPhrase, setHasSeedPhrase] = useState(true)

  const onChangePassword = (e) => {
    setPassword(e.target.value)
  }

  const handleReveal = () => {
    if (password.length === 0) {
      setError(ERROR_MESSAGE.EMPTY_FIELDS)
    } else {
      onReveal(password)
    }
  }

  useEffect(() => {
    async function getHasSeedPhrase() {
      const _account = await popupAccount.getAccount({ address: account.address })
      const encryptedSeed = await _account.get.seedPhrase()
      if (!encryptedSeed) setHasSeedPhrase(false)
    }

    getHasSeedPhrase()
  }, [])

  return (
    <Modal onClose={onClose} className='reveal-seed-phrase'>
      {
        hasSeedPhrase ? 
          <div className='wrapper'>
            <div className='modal-title'>Reveal Seed Phrase</div>
            <div className='modal-description'>
              If you change browsers or computers, you will need this seed phrase to access your account.
              <br/>
              <span >{' '} </span>
              Save it somewhere <strong>safe and secret</strong>.
            </div>
            <div className='modal-warning'>
              <div className='warning-icon'>
                <WarningIcon />
              </div>
              <div className='warning-message' >
              Never disclose your backup phrase. Anyone with this phrase can steal your accounts.
              </div>
            </div>
            <Input label='Enter your password' className='password-field' value={password} onChange={onChangePassword}/>
            <div className='buttons-line'>
              <Button label='Reveal' onClick={handleReveal} className='modal-action-button reveal'/>
              <Button label='Go Back' type='outline' onClick={onClose} className='modal-action-button close'/>
            </div>
          
          </div> :
          <NoSeedphrase onClose={onClose}/>
      }
    </Modal>
  )
}

export default connect(null, { setError })(RevealSeedPhraseModal)
