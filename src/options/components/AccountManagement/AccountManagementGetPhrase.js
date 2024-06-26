import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import clsx from 'clsx'
import ArLogo from 'img/v2/arweave-logos/arweave-logo.svg'
import EthLogo from 'img/v2/ethereum-logos/ethereum-logo.svg'
import K2Logo from 'img/v2/k2-logos/finnie-k2-logo.svg'
import KoiiLogo from 'img/v2/koii-logos/finnie-koii-logo-blue.svg'
import SolLogo from 'img/v2/solana-logo.svg'
import isEmpty from 'lodash/isEmpty'
import CheckBox from 'options/components/CheckBox'
import Hint from 'options/components/Hint'
import formatLongString from 'options/utils/formatLongString'

const tabs = ['K2', 'ETH', 'SOL', 'AR']

const AccountManagement = ({ accounts, setSelectedAccount, setShowExportBackupPhraseModal }) => {
  const defaultK2AccountAddress = useSelector((state) => state.defaultAccount.K2?.address)
  const defaultArweaveAccountAddress = useSelector((state) => state.defaultAccount.AR?.address)
  const defaultEthereumAccountAddress = useSelector((state) => state.defaultAccount.ETH?.address)
  const defaultSolanaAccountAddress = useSelector((state) => state.defaultAccount.SOL?.address)

  const [currentTab, setCurrentTab] = useState('K2')

  const showAccounts = useMemo(
    () => accounts.filter((account) => account.type.includes(currentTab)),
    [currentTab]
  )

  const changeTab = (newTab) => setCurrentTab(newTab)

  return (
    <>
      <div className="flex items-center justify-start gap-10 font-bold text-xs mb-4">
        {tabs.map((tab) => (
          <div
            className={clsx(
              'cursor-pointer',
              currentTab === tab && 'text-success border-b-2 border-success'
            )}
            onClick={() => changeTab(tab)}
            key={tab}
          >{`${tab} wallets`}</div>
        ))}
      </div>
      <table className="w-full bg-trueGray-100 rounded-finnie text-indigo">
        <thead className="text-4xs font-normal">
          <tr className="text-left h-8">
            <td className="pl-2">{chrome.i18n.getMessage('defaultUc')}</td>
            <td className="text-center">{chrome.i18n.getMessage('accountNameUc')}</td>
            <td>{chrome.i18n.getMessage('addressUc')}</td>
            <td />
          </tr>
        </thead>
        <tbody className="text-xs tracking-finnieSpacing-wide">
          {showAccounts.map((account, idx) => {
            const hasSeedPhrase = !isEmpty(account.seedPhrase)
            return (
              <tr
                key={idx}
                className={clsx(
                  'text-left h-8',
                  idx % 2 === 1 && 'bg-lightBlue',
                  !hasSeedPhrase && 'bg-trueGray-100 text-blueGray-500'
                )}
              >
                <td className="pl-2">
                  <CheckBox
                    checked={
                      defaultK2AccountAddress === account.address ||
                      defaultArweaveAccountAddress === account.address ||
                      defaultEthereumAccountAddress === account.address ||
                      defaultSolanaAccountAddress === account.address
                    }
                  />
                </td>
                <td>
                  {currentTab === 'K2' && (
                    <K2Logo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                  )}
                  {currentTab === 'AR' && (
                    <ArLogo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                  )}
                  {currentTab === 'ETH' && (
                    <EthLogo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                  )}
                  {currentTab === 'SOL' && (
                    <SolLogo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                  )}
                  {formatLongString(account.accountName, 12)}
                </td>
                <td>{formatLongString(account.address, 22)}</td>
                <td className="w-50 ">
                  <button
                    className={clsx(
                      'text-center text-xs tracking-finnieSpacing-wide h-6 w-32 rounded-sm shadow-sm',
                      !hasSeedPhrase
                        ? 'bg-trueGray-400 text-blueGray-600 cursor-not-allowed'
                        : 'text-white bg-blue-800'
                    )}
                    disabled={!hasSeedPhrase}
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowExportBackupPhraseModal(true)
                    }}
                  >
                    {hasSeedPhrase ? 'Get Phrase' : 'Unavailable'}
                  </button>
                  {!hasSeedPhrase && (
                    <Hint
                      className="inline ml-4.25"
                      text={chrome.i18n.getMessage('notGeneratedWithSecretPhrase')}
                      place="right"
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default AccountManagement
