import React from 'react'
import { useSelector } from 'react-redux'

import ArrowIcon from 'img/down-arrow-icon.svg'
import EthereumIcon from 'img/popup/ethereum-icon.svg'
import FinnieIcon from 'img/popup/finnie-icon.svg'
import SolanaIcon from 'img/v2/solana-logo.svg'

import { TYPE } from 'constants/accountConstants'

// selectors
import { getDisplayingAccount } from 'popup/selectors/displayingAccount'

const Account = ({ showAccountDropdown, setShowAccountDropdown }) => {
  const displayingAccount = useSelector(getDisplayingAccount)

  return (
    <div
      className="bg-blue-800 flex items-center justify-between cursor-pointer select-none"
      style={{ width: '249px', height: '100%' }}
      onClick={() => {
        setShowAccountDropdown((prev) => !prev)
      }}
    >
      <div className="ml-2.5 flex items-center">
        {displayingAccount.type === TYPE.ARWEAVE && (
          <FinnieIcon style={{ width: '25px', height: '25px' }} />
        )}
        {displayingAccount.type === TYPE.ETHEREUM && (
          <EthereumIcon style={{ width: '25px', height: '25px' }} />
        )}
        {displayingAccount.type === TYPE.SOLANA && (
          <SolanaIcon style={{ width: '25px', height: '25px' }} />
        )}
        <div className="ml-2 font-semibold text-base leading-8 tracking-finnieSpacing-tight text-white">
          {displayingAccount?.accountName}
        </div>
      </div>
      <ArrowIcon
        className="mr-6.5"
        style={{ transform: !showAccountDropdown ? 'none' : 'rotateX(180deg)' }}
      />
    </div>
  )
}

export default Account
