import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import PopupBackground from 'img/popup/popup-background.svg'
import FinnieIcon from 'img/popup/finnie-icon-blue.svg'
import EthereumIcon from 'img/popup/ethereum-icon.svg'
import SendIcon from 'img/popup/send-icon.svg'
import ReceiveIcon from 'img/popup/receive-icon.svg'

import { TYPE } from 'constants/accountConstants'
import { fiatCurrencyFormat, numberFormat } from 'utils'
import AccountInfo from './AccountInfo/AccountInfo'

const Home = () => {
  const defaultAccount = useSelector((state) => state.defaultAccount)
  const price = useSelector((state) => state.price)

  return (
    <div className="flex flex-col w-full h-full">
      <div className="pt-4.75 pl-4.75 mb-3.5">
        <FinnieIcon className="" style={{ width: '54px', height: '40px' }} />
        {defaultAccount.type !== TYPE.ETHEREUM && (
          <>
            <div className="mt-6.5">
              <div className="text-blue-800 text-4xl tracking-finnieSpacing-tightest">
                {numberFormat(defaultAccount.koiBalance)} KOII
              </div>
              <div
                hidden
                className="text-base leading-8 tracking-finnieSpacing-tight"
                style={{ color: '#707070' }}
              >
                ${fiatCurrencyFormat(defaultAccount.koiBalance * price.KOI)} USD
              </div>
            </div>
          </>
        )}
        {defaultAccount.type === TYPE.ETHEREUM && (
          <>
            <div className="mt-6.5">
              <div className="text-blue-800 text-4xl tracking-finnieSpacing-tightest">
                {numberFormat(defaultAccount.balance)} ETH
              </div>
              <div
                className="text-base leading-8 tracking-finnieSpacing-tight"
                style={{ color: '#707070' }}
              >
                ${fiatCurrencyFormat(defaultAccount.balance * price.ETH)} USD
              </div>
            </div>
          </>
        )}

        <div className="mt-5 flex items-center justify-between" style={{ width: '140px' }}>
          <div className="flex flex-col items-center justify-center">
            <div
              className="rounded-full bg-lightBlue shadow flex items-center justify-center cursor-pointer"
              style={{ width: '44px', height: '44px' }}
            >
              <SendIcon style={{ width: '23px', height: '20px' }} />
            </div>
            <div className="mt-2.25 text-center text-xs leading-3 tracking-finnieSpacing-wide">
              SEND
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Link
              className="rounded-full bg-lightBlue shadow flex items-center justify-center cursor-pointer"
              style={{ width: '44px', height: '44px' }}
              to="/receive"
            >
              <ReceiveIcon style={{ width: '23px', height: '20px' }} />
            </Link>
            <div className="mt-2.25 text-center text-xs leading-3 tracking-finnieSpacing-wide">
              RECEIVE
            </div>
          </div>
        </div>
        <PopupBackground className="absolute top-13.5 right-0 z-10" />
      </div>
      <AccountInfo />
    </div>
  )
}

export default Home
