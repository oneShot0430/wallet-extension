import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import isEmpty from 'lodash/isEmpty'

import { TYPE } from 'constants/accountConstants'
import { fiatCurrencyFormat, numberFormat } from 'utils'
import { fromArToWinston, fromEthToWei } from 'utils'
import { setIsLoading } from 'popup/actions/loading'

import FinnieIcon from 'img/v2/koii-logos/finnie-koii-logo-blue.svg'
import EthereumIcon from 'img/v2/ethereum-logos/ethereum-logo.svg'
import ArweaveIcon from 'img/v2/arweave-logos/arweave-logo.svg'

// hooks
import useImportedTokenAddresses from 'popup/sharedHooks/useImportedTokenAddresses'

// selectors
import { getDisplayingAccount } from 'popup/selectors/displayingAccount'

// utils
import getTokenData from 'utils/getTokenData'

const Tokens = ({ currentProviderAddress }) => {
  const dispatch = useDispatch()

  const displayingAccount = useSelector(getDisplayingAccount)
  const price = useSelector((state) => state.price)

  const { importedTokenAddresses } = useImportedTokenAddresses({
    userAddress: displayingAccount.address,
    currentProviderAddress,
    displayingAccountAddress: displayingAccount.address
  })

  const [tokens, setTokens] = useState([])

  const loadTokenList = async () => {
    dispatch(setIsLoading(true))
    if (displayingAccount.type === TYPE.ARWEAVE) {
      setTokens([
        {
          name: 'Arweave',
          balance: numberFormat(fromArToWinston(displayingAccount.balance)),
          displayingBalance: numberFormat(displayingAccount.balance),
          symbol: 'AR',
          usdValue: fiatCurrencyFormat(displayingAccount.balance * price.AR),
          decimal: 12
        },
        {
          name: 'KOII',
          balance: numberFormat(displayingAccount.koiBalance),
          displayingBalance: numberFormat(displayingAccount.koiBalance),
          symbol: 'KOII',
          decimal: 0
        }
      ])
      dispatch(setIsLoading(false))
      return
    }

    const importTokens = [
      {
        name: 'Ethereum',
        balance: numberFormat(fromEthToWei(displayingAccount.balance)),
        displayingBalance: numberFormat(displayingAccount.balance),
        usdValue: fiatCurrencyFormat(displayingAccount.balance * price.ETH),
        symbol: 'ETH',
        decimal: 18
      }
    ]
    await Promise.all(
      importedTokenAddresses.map(async (contractAddress) => {
        let token = await getTokenData(contractAddress, displayingAccount.address)
        token = { ...token, displayingBalance: token.balance / Math.pow(10, token.decimal) }
        if (token.price) {
          token = {
            ...token,
            usdValue: fiatCurrencyFormat(
              (token.balance / Math.pow(10, token.decimal)) * token.price
            )
          }
        }
        importTokens.push(token)
      })
    )

    setTokens(importTokens)
    dispatch(setIsLoading(false))
  }

  useEffect(() => {
    loadTokenList()
  }, [importedTokenAddresses])

  const handleRefreshTokenList = async () => {
    await loadTokenList()
  }

  const [accountInfoMinHeight, setAccountInfoMinHeight] = useState(0)
  const accountInfoRef = useRef(null)

  useEffect(() => {
    const accountInfoField = accountInfoRef.current
    if (accountInfoField) {
      const scrollHeight = accountInfoField.scrollHeight
      if (scrollHeight < 150) {
        setAccountInfoMinHeight(0)
        return
      }

      if (scrollHeight >= 150) {
        setAccountInfoMinHeight(350)
        return
      }
    }
  }, [tokens])

  return (
    <div
      className="w-full px-3"
      ref={accountInfoRef}
      style={{ minHeight: `${clsx(accountInfoMinHeight)}px` }}
    >
      {tokens.map((token, idx) => (
        <div
          key={idx}
          className={clsx(
            'w-full flex items-center justify-between px-2 py-3 text-blue-800 text-sm',
            'border-b border-trueGray-400'
          )}
        >
          <div className="flex items-center">
            {token.name === 'Ethereum' && <EthereumIcon className="w-8.75 h-8.75" />}
            {token.name === 'KOII' && <FinnieIcon className="w-8.75 h-8.75" />}
            {token.name === 'Arweave' && <ArweaveIcon className="w-8.75 h-8.75" />}
            {token.name !== 'Ethereum' &&
              token.name !== 'KOII' &&
              token.name !== 'Arweave' &&
              (token.logo ? (
                <img src={token.logo} className="w-8.75 h-8.75" />
              ) : (
                <img
                  src={`img/v2/custom-tokens/custom-token-${Math.floor(Math.random() * 5)}.svg`}
                  className="w-8.75 h-8.75"
                />
              ))}
            <span className="font-semibold ml-2.75">{token.name}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-semibold">
              {token.displayingBalance} {token.symbol}
            </div>
            {token.usdValue && <div>{token.usdValue} USD</div>}
          </div>
        </div>
      ))}
      {displayingAccount.type === TYPE.ETHEREUM && (
        <div className="mt-5 font-normal text-xs text-center tracking-finnieSpacing-wide text-blue-800">
          Don’t see your token?
        </div>
      )}
      {displayingAccount.type === TYPE.ETHEREUM && (
        <div className="mt-1.5 mb-4 font-normal text-xs text-center tracking-finnieSpacing-wide text-blue-800">
          {/* <span
          className="cursor-pointer underline text-success-700"
          onClick={() => handleRefreshTokenList()}
        >
          Refresh list
        </span>{' '}
        or{' '} */}
          <Link className="cursor-pointer underline text-success-700" to="/import-token">
            Import a token
          </Link>
        </div>
      )}
    </div>
  )
}

export default Tokens
