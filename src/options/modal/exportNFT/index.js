import React, { useState } from 'react'
import Modal from 'options/shared/modal'

import './index.css'

import EthereumLogo from 'img/chain/ethereum-logo.svg'
import BinanceLogo from 'img/chain/binance-logo.svg'
import Avalanche from 'img/chain/avalanche-logo.svg'
import PolkadotLogo from 'img/chain/polkadot-logo.svg'
import TezosLogo from 'img/chain/tezos-logo.svg'

import Ethereum from './Ethereum'

const Chain = ({ Icon, title }) => {
  return (
    <div className='export-nft chain container'>
      <div className='export-nft chain icon'>
        <Icon />
      </div>
      <div className='export-nft chain text'>{title}</div>
    </div>
  )
}

const ExportNFT = ({ info }) => {
  const [isShowEthereum, setIsShowEthereum] = useState(false)

  return (
    <div className='export-nft container'>
      <div className='export-nft title container'>
        Share to earn Attention Rewards
        <div className='export-nft title description'>
          List your NFT on any exchange or display it in a gallery on any chain,
          without making a duplicate.
        </div>
      </div>

      <div className='ethereum' onClick={() => setIsShowEthereum(true)}>
        <EthereumLogo className='logo' />
        <div className='text'>Ethereum</div>
      </div>

      <div className='coming-soon'>Coming soon:</div>

      <div className='export-nft chains container'>
        <Chain Icon={TezosLogo} title='Tezos' />
        <Chain Icon={PolkadotLogo} title='Polkadot' />
        <Chain Icon={BinanceLogo} title='Binance' />
        <Chain Icon={Avalanche} title='Avalanche' />
      </div>

      {isShowEthereum && (
        <Ethereum info={info} onClose={() => setIsShowEthereum(false)} />
      )}
    </div>
  )
}

export default ({ onClose, info }) => {
  return (
    <div>
      <Modal onClose={onClose}>
        <ExportNFT info={info} />
      </Modal>
    </div>
  )
}
