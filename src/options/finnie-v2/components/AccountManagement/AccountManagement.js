import clsx from 'clsx'
import React, { useMemo, useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import DropDown from 'finnie-v2/components/DropDown'
import formatLongString from 'finnie-v2/utils/formatLongString'

import ArLogo from 'img/v2/arweave-logos/arweave-logo.svg'
import EthLogo from 'img/v2/ethereum-logos/ethereum-logo.svg'
import CopyIcon from 'img/v2/copy-icon.svg'

import storage from 'services/storage'
import { popupBackgroundRequest as backgroundRequest } from 'services/request/popup'
import { setDefaultAccountByAddress } from 'options/actions/defaultAccount'
import { GalleryContext } from 'options/galleryContext'
import { DidContext } from 'options/context'

import CheckBox from 'finnie-v2/components/CheckBox'

const tabs = ['AR', 'ETH']

const Address = ({ address }) => {
  const [isCopied, setIsCopied] = useState(false)

  const onCopy = () => {
    setIsCopied(true)

    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <>
      {formatLongString(address, 22)}
      <div className="relative inline ">
        <CopyToClipboard text={address} onCopy={onCopy}>
          <CopyIcon className="inline cursor-pointer w-3.25 ml-2" />
        </CopyToClipboard>
        {isCopied && (
          <span className="text-11px absolute top-0 -right-14 text-blue-800">Copied!</span>
        )}
      </div>
    </>
  )
}

const AccountManagement = ({ accounts }) => {
  const { setNotification, setError } = useContext(GalleryContext)
  const { getDID } = useContext(DidContext)

  const dispatch = useDispatch()
  const defaultArweaveAccountAddress = useSelector((state) => state.defaultAccount.AR?.address)
  const defaultEthereumAccountAddress = useSelector((state) => state.defaultAccount.ETH?.address)

  const [currentTab, setCurrentTab] = useState('AR')

  const showAccounts = useMemo(
    () => accounts.filter((account) => account.type.includes(currentTab)),
    [currentTab]
  )

  const reloadDefaultAccount = async () => {
    const activatedArweaveAccountAddress = await storage.setting.get.activatedArweaveAccountAddress()
    dispatch(setDefaultAccountByAddress(activatedArweaveAccountAddress))

    const activatedEthereumAccountAddress = await storage.setting.get.activatedEthereumAccountAddress()
    dispatch(setDefaultAccountByAddress(activatedEthereumAccountAddress))
  }

  const handleSetDefaultAccount = async (address) => {
    try {
      await backgroundRequest.gallery.setDefaultAccount({ address })
      await reloadDefaultAccount()
      getDID()
      setNotification(`Set default account successfully.`)
    } catch (err) {
      setError(err.message)
    }
  }

  // @TODO
  // Still in use
  // const options = useMemo(
  //   () =>
  //     currentTab === 'ETH'
  //       ? [
  //         { label: 'Ethereum Mainnet', value: 'mainnet' },
  //         { label: 'Rinkeby Testnet', value: 'testnet' }
  //       ]
  //       : [
  //         { label: 'AR Mainnet', value: 'mainnet' },
  //         { label: 'AR Testnet', value: 'testnet' }
  //       ],
  //   [currentTab]
  // )

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
      <table className="w-2/3 bg-trueGray-100 rounded-finnie text-indigo">
        <thead className="text-4xs font-normal">
          <tr className="text-left h-8">
            <td className="pl-2">DEFAULT</td>
            <td className="text-center">ACCOUNT NAME</td>
            <td>ADDRESS</td>
            {/* <td>LAYER</td> */}
          </tr>
        </thead>
        <tbody className="text-xs tracking-finnieSpacing-wide">
          {showAccounts.map((account, idx) => (
            <tr key={idx} className={clsx('text-left h-8', idx % 2 === 1 && 'bg-lightBlue')}>
              <td className="pl-2">
                <CheckBox
                  onClick={() => handleSetDefaultAccount(account.address)}
                  checked={
                    defaultArweaveAccountAddress === account.address ||
                    defaultEthereumAccountAddress === account.address
                  }
                />
              </td>
              <td>
                {currentTab === 'AR' ? (
                  <ArLogo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                ) : (
                  <EthLogo className="inline mr-2 w-6 h-6 shadow-sm rounded-full" />
                )}
                {formatLongString(account.accountName, 12)}
              </td>
              <td>
                <Address address={account.address} key={account.address} />
              </td>
              {/* Still in use */}
              {/* <td className="w-50 pr-10">
                <DropDown size="sm" variant="light" options={options} value="mainnet" />
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default AccountManagement
