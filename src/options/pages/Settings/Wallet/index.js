import React, { useContext, useEffect,useMemo, useState } from 'react'
import { DragDropContext, Draggable,Droppable } from 'react-beautiful-dnd'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { TYPE } from 'constants/accountConstants'
import { OS,STORAGE } from 'constants/koiConstants'
import data from 'currency-codes/data'
import getSymbolFromCurrency from 'currency-symbol-map'
import AccountCard from 'finnie-v2/components/AccountCard'
import AccountManagement from 'finnie-v2/components/AccountManagement'
import ConfirmRemoveAccountModal from 'finnie-v2/components/AccountManagement/ConfirmRemoveAccountModal'
import ConnectedSitesModal from 'finnie-v2/components/ConnectedSitesModal'
import DropDown from 'finnie-v2/components/DropDown'
import { get,isEmpty } from 'lodash'
import { GalleryContext } from 'options/galleryContext'
import storage from 'services/storage'
import { getChromeStorage, isSolanaAddress,setChromeStorage } from 'utils'

// import AccountOrder from './AccountOrder'
import AcceptedCurrencies from './currencies'

import './index.css'

const mockedWalletDisplayOptions = [{ value: 'accountsummary', label: 'Account Summary' }]

export default () => {
  const history = useHistory()
  const { setError, setNotification } = useContext(GalleryContext)

  const [currency, setCurrency] = useState('USD')
  const [chainOption, setChainOption] = useState('ALL')
  const [showConfirmRemoveAccount, setShowConfirmRemoveAccount] = useState(false)
  const [showConnectedSites, setShowConnectedSites] = useState(false)
  const [accountConnectSites, setAccountConnectSites] = useState({})
  const [removeAccount, setRemoveAccount] = useState({})
  const [listAccounts, setListAccounts] = useState([])

  const accounts = useSelector((state) => state.accounts)

  const currenciesData = useMemo(
    () =>
      data
        .filter(({ code }) => AcceptedCurrencies.includes(code))
        .map(({ code, currency }) => ({
          label: `${getSymbolFromCurrency(code) || ''} ${currency} (${code})`,
          value: code
        })),
    [data]
  )

  const chainOptions = [
    { label: 'All Accounts', value: 'ALL' },
    { label: 'K2 Account', value: TYPE.K2 },
    { label: 'Ethereum Account', value: TYPE.ETHEREUM },
    { label: 'Solana Account', value: TYPE.SOLANA },
    { label: 'Arweave Account', value: TYPE.ARWEAVE }
  ]

  useEffect(() => {
    const getCurrency = async () => {
      const storage = await getChromeStorage(STORAGE.CURRENCY)
      const storedCurrency = storage[STORAGE.CURRENCY] || 'USD'
      setCurrency(storedCurrency)
    }

    getCurrency()
  }, [])

  const onImportSeedPhrase = () => {
    history.push('/import-wallet')
  }

  const onImportKeyFile = () => {
    history.push('/upload-wallet')
  }

  const onCreateWallet = () => {
    history.push('/create-wallet')
  }

  const onCurrencyChange = async (currency) => {
    try {
      // Fetch to check if we can get AR price in this currency
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=${currency}`
      )
      const price = get(response, 'data.arweave')
      if (!price || isEmpty(price)) {
        setError(`We cannot get AR price for the currency ${currency}.`)
        setCurrency('USD')
      } else {
        setCurrency(currency)
        await setChromeStorage({ [STORAGE.CURRENCY]: currency })
        // set value for new storage object
        await storage.setting.set.selectedCurrency(currency)
        setNotification(`Default currency set to ${currency}.`)
      }
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    }
  }

  useEffect(() => {
    if (chainOption !== 'ALL') {
      const showAccountList = accounts.filter((account) => account.type.includes(chainOption))
      setListAccounts(showAccountList)
    } else {
      setListAccounts(accounts)
    }
  }, [chainOption, accounts])

  const onChainOption = (chain) => {
    setChainOption(chain)
  }

  const reorder = (list, startIndex, endIndex) => {
    try {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      return result
    } catch (err) {
      console.error('reorder - Error: ', err.message)
    }
  }

  const onDragEnd = (result) => {
    try {
      if (!result.destination) {
        return
      }

      if (result.destination.index === result.source.index) {
        return
      }

      const listAccountsAfterDrag = reorder(
        listAccounts,
        result.source.index,
        result.destination.index
      )

      setListAccounts(listAccountsAfterDrag)
    } catch (error) {
      console.error('onDragEnd - Error: ', error.message)
    }
  }

  return (
    <div className="wallet-settings-wrapper">
      <div className="wallet-settings">
        <div className="header">Wallet Settings</div>
        <div className="mt-10 pl-5">
          <div className="add-wallet pb-2 mb-4 border-b border-white">
            <div className="font-semibold text-base leading-8 uppercase">Add a Key</div>
            <div className="flex gap-6.75">
              <div
                className="bg-success rounded-sm text-center text-indigo text-sm leading-4 font-normal flex justify-center items-center mr-6.75 cursor-pointer"
                style={{ width: '220px', height: '38px' }}
                onClick={onCreateWallet}
              >
                Create a New Key
              </div>
              <div
                className="bg-trueGray-100 rounded-sm text-center text-indigo text-sm leading-4 font-normal flex justify-center items-center cursor-pointer"
                style={{ width: '220px', height: '38px' }}
                onClick={onImportSeedPhrase}
              >
                Import with Phrase
              </div>
            </div>
            {/* <div
              className="mt-2.5 font-normal text-xs underline tracking-finnieSpacing-wide text-lightBlue cursor-pointer"
              onClick={onImportKeyFile}
            >
              Import a JSON file.
            </div> */}
          </div>

          <div className="default-currency pb-6 mb-4 border-b border-white">
            <div className="font-semibold text-base leading-8 uppercase">Default Currency</div>
            <div className="text-sm leading-6 mb-1">
              Select the exchange currency displayed next to your tokens and transactions.
            </div>
            <div className="text-xs leading-4 mb-4.5 text-lightBlue">
              We can only show the exchange rate for fiat currencies at this time.
            </div>
            <div style={{ width: '270px' }}>
              <DropDown
                options={currenciesData}
                value={currency}
                onChange={onCurrencyChange}
                variant="dark"
                size="lg"
                filterSupported={false}
              />
            </div>
          </div>

          <div className="display-order pb-6 mb-4 border-b border-white">
            <div className="font-semibold text-base leading-8 uppercase">Key Details</div>
            <div className="text-sm leading-6 mb-4.5">
              Organize your wallet display and select a default key. This key will be automatically
              selected to create NFTs and send tokens.
            </div>
            <div className="mb-1.5" style={{ width: '270px' }}>
              <DropDown
                options={chainOptions}
                value={chainOption}
                onChange={onChainOption}
                variant="dark"
                size="lg"
                filterSupported={false}
              />
            </div>
            {/* TODO - DatH - Hide drag and drop */}
            {/* <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="list">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {listAccounts.map((account, index) => (
                      <Draggable draggableId={account.address} index={index} key={account.address}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <AccountCard
                              account={account}
                              setShowConfirmRemoveAccount={setShowConfirmRemoveAccount}
                              setRemoveAccount={setRemoveAccount}
                              setShowConnectedSites={setShowConnectedSites}
                              setAccountConnectSites={setAccountConnectSites}
                              dragProvided={provided}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext> */}
            {listAccounts.map((account, index) => (
              <AccountCard
                key={index}
                account={account}
                setShowConfirmRemoveAccount={setShowConfirmRemoveAccount}
                setRemoveAccount={setRemoveAccount}
                setShowConnectedSites={setShowConnectedSites}
                setAccountConnectSites={setAccountConnectSites}
              />
            ))}
          </div>
        </div>
      </div>

      {showConfirmRemoveAccount && (
        <ConfirmRemoveAccountModal
          account={removeAccount}
          close={() => setShowConfirmRemoveAccount(false)}
        />
      )}

      {showConnectedSites && (
        <ConnectedSitesModal
          account={accountConnectSites}
          close={() => setShowConnectedSites(false)}
        />
      )}
    </div>
  )
}
