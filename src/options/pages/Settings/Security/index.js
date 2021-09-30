import React, { useContext, useState, useMemo, useEffect } from 'react'
import passworder from 'browser-passworder'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'

import FinnieIcon from 'img/finnie-koi-logo-blue.svg'
import EthereumIcon from 'img/ethereum-logo-18.svg'
import { getDisplayAddress } from 'options/utils'
import { getChromeStorage } from 'utils'
import { STORAGE } from 'constants/koiConstants'

import { GalleryContext } from 'options/galleryContext'

import {
  ExportBackupPhraseModal,
  ExportBackupKeyFileModal,
} from './ExportModal'

import './index.css'
import { TYPE } from 'constants/accountConstants'

export default () => {
  const { address, accountName, wallets, arWallets } = useContext(GalleryContext)
  const [seedPhrase, setSeedPhrase] = useState('')
  const [hasSeedPhrase, setHasSeedPhrase] = useState(false)

  const [
    showExportBackupPhraseModal,
    setShowExportBackupPhraseModal,
  ] = useState(false)

  const [
    showExportBackupKeyfileModal,
    setShowExportBackupKeyfileModal,
  ] = useState(false)

  const [selectedAccount, setSelectedAccount] = useState()

  useEffect(() => {
    const checkSeedPhrase = async () => {
      const storage = await getChromeStorage(STORAGE.KOI_PHRASE)
      if (storage[STORAGE.KOI_PHRASE]) setHasSeedPhrase(true)
    }

    checkSeedPhrase()
  }, [])
  
  const onSeedPhraseClick = (account) => {
    setSelectedAccount(account)
    setShowExportBackupPhraseModal(true)
  }

  const onKeyFileClick = (account) => {
    setSelectedAccount(account)
    setShowExportBackupKeyfileModal(true)
  }

  const closeModal = () => {
    setSelectedAccount({})
    setShowExportBackupKeyfileModal(false)
    setShowExportBackupPhraseModal(false)
  }

  return (
    <div className='security-settings-wrapper'>
      <div
        className='security-settings'
        style={{
          filter: `${
            showExportBackupPhraseModal || showExportBackupKeyfileModal
              ? 'blur(8px)'
              : 'none'
          }`,
        }}
      >
        <div className='header'>Security Settings</div>
        <div className='content'>
          <div className='backup-seedphrase'>
            <div className='title'>Get my Backup (seed) Phrase</div>
            <div className='description'>
              Select a wallet to see its recovery phrase.
            </div>
            <div className='seedphrase'>
              {wallets.map((account) => {
                if (account.seedPhrase) return (
                  <div
                    key={account.id}
                    className='account'
                    onClick={() => onSeedPhraseClick(account)}
                  >
                    <div className='name-icon'>
                      {account.type === TYPE.ARWEAVE && <FinnieIcon className='finnie-icon' />}
                      {account.type === TYPE.ETHEREUM && <EthereumIcon className='finnie-icon'/>}
                      <div className='account-name'>{account.accountName}</div>
                    </div>
                    <div className='account-address'>
                      {getDisplayAddress(account.address)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='backup-keyfile'>
            <div className='title'>Export my Private Key</div>
            <div className='description'>
              Select a wallet to download its private key.
            </div>
            <div className='keyfile'>
              {arWallets.map((account) => (
                <div
                  key={account.id}
                  className='account'
                  onClick={() => onKeyFileClick(account)}
                >
                  <div className='name-icon'>
                    <FinnieIcon className='finnie-icon' />
                    <div className='account-name'>{account.accountName}</div>
                  </div>
                  <div className='account-address'>
                    {getDisplayAddress(account.address)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showExportBackupPhraseModal && (
        <ExportBackupPhraseModal
          account={selectedAccount}
          closeModal={closeModal}
        />
      )}

      {showExportBackupKeyfileModal && (
        <ExportBackupKeyFileModal
          account={selectedAccount}
          closeModal={closeModal}
        />
      )}
    </div>
  )
}
