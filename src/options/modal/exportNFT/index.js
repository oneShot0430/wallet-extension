import React from 'react'
import { TYPE } from 'constants/accountConstants'
import Modal from 'options/shared/modal'

import ExportWallet from './ExportWallet'

import './index.css'

export default ({ onClose, info }) => {
  const { type } = info
  const walletType = type === TYPE.ARWEAVE ? TYPE.ETHEREUM : TYPE.ARWEAVE

  return (
    <Modal onClose={onClose}>
      <ExportWallet info={info} type={walletType} onClose={onClose} />
    </Modal>
  )
}
