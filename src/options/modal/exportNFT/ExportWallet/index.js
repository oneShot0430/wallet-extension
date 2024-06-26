import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { TYPE } from 'constants/accountConstants'
import { ETH_NETWORK_PROVIDER, KOI_ROUTER_CONTRACT } from 'constants/koiConstants'
// import Web3 from 'web3'
import { ethers } from 'ethers'
import ArweaveLogo from 'img/arweave-icon.svg'
import WarningIcon from 'img/dangerous-logo.svg'
import EthereumLogo from 'img/ethereum-logo-18.svg'
import FinnieIcon from 'img/finnie-koi-logo-blue.svg'
import GoBackIcon from 'img/goback-icon-26px.svg'
import QuestionIcon from 'img/question-tooltip.svg'
import StackIcon from 'img/stack-icon.svg'
import StackWhiteIcon from 'img/stack-white-icon.svg'
import find from 'lodash/find'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import { setAssets } from 'options/actions/assets'
import { setError } from 'options/actions/error'
import { formatNumber, getDisplayAddress } from 'options/utils'
import { popupAccount } from 'services/account'
import koiRouterABI from 'services/account/Account/Chains/Ethereum/abi/KoiRouter.json'
import koiTokenABI from 'services/account/Account/Chains/Ethereum/abi/KoiToken.json'
import { popupBackgroundRequest as backgroundRequest } from 'services/request/popup'
import { clarifyEthereumProvider } from 'utils'
import { getAddressesFromAddressBook } from 'utils'
import { isArweaveAddress } from 'utils'
import { isEthereumAddress } from 'utils'

import './index.css'

const TRANSFER_STEPS = {
  INPUT_INFO: 1,
  CONFIRM: 2,
  SUCCESS: 3
}

const TITLES_ETH = {
  1: <div className="title">{chrome.i18n.getMessage('transferMediaToETH')}</div>,
  2: <div className="title">{chrome.i18n.getMessage('confirmTransfer')}</div>,
  3: <div className="title">{chrome.i18n.getMessage('nftToETH')}</div>
}

const TITLES_AR = {
  1: <div className="title">{chrome.i18n.getMessage('transferMediaToAR')}</div>,
  2: <div className="title">{chrome.i18n.getMessage('confirmTransfer')}</div>,
  3: <div className="title">{chrome.i18n.getMessage('nftToAR')}</div>
}

const DESCRIPTIONS_ETH = {
  1: (
    <div className="description">
      {chrome.i18n.getMessage('exportNFTToETHDesc1')}&nbsp;
      <a href="#" className="link">
        {chrome.i18n.getMessage('learnMore')}
      </a>
      .
    </div>
  ),
  2: (
    <div className="description">
      {chrome.i18n.getMessage('exportNFTToETHDesc1')}&nbsp;
      <a href="#" className="link">
        {chrome.i18n.getMessage('learnMore')}
      </a>
      .
    </div>
  ),
  3: <div className="description">{chrome.i18n.getMessage('exportNFTToETHDesc2')}</div>
}

const DESCRIPTIONS_AR = {
  1: (
    <div className="description">
      {chrome.i18n.getMessage('exportNFTToARDesc1')}&nbsp;
      <a href="#" className="link">
        {chrome.i18n.getMessage('learnMore')}
      </a>
      .
    </div>
  ),
  2: (
    <div className="description">
      {chrome.i18n.getMessage('exportNFTToARDesc1')}&nbsp;
      <a href="#" className="link">
        {chrome.i18n.getMessage('learnMore')}
      </a>
      .
    </div>
  ),
  3: <div className="description">{chrome.i18n.getMessage('exportNFTToARDesc2')}</div>
}

const AddressDropdown = ({ accounts = [], onChange, type }) => {
  return (
    <div className="accounts">
      {accounts.map((account, index) => {
        if (account.type == type) {
          return (
            <div
              key={account.address + index}
              className="account"
              onClick={() => onChange(account)}
            >
              <div className="logo">
                {account.type === TYPE.ARWEAVE && <ArweaveLogo />}
                {account.type === TYPE.ETHEREUM && <EthereumLogo />}
              </div>
              <div className="info">
                <div className="name">{account.accountName}</div>
                <div className="address">{getDisplayAddress(account.address)}</div>
              </div>
            </div>
          )
        }
      })}
      <div className="different-address" onClick={() => onChange({})}>
        <div className="name">{chrome.i18n.getMessage('enterDifferentAddress')}...</div>
      </div>
    </div>
  )
}

export default ({ info, onClose, type }) => {
  const [address, setAddress] = useState('')
  const [numberTransfer, setNumberTransfer] = useState(1)
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const [chosenAccount, setChosenAccount] = useState({})
  const [step, setStep] = useState(1)
  const [isBridging, setIsBridging] = useState(false)
  const [walletType, setWalletType] = useState('')
  const [estimateGasUnit, setEstimateGasUnit] = useState(0)
  const [currentGasPrice, setCurrentGasPrice] = useState(0)
  const [totalGasCost, setTotalGasCost] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [settingApproval, setSettingApproval] = useState(false)
  const [approvedStatusLoaded, setApprovedStatusLoaded] = useState(false)
  const [addressOptions, setAddressOptions] = useState([])

  const addressInputRef = useRef()

  const accounts = useSelector((state) => state.accounts)
  const assets = useSelector((state) => state.assets)
  const dispatch = useDispatch()

  const totalTransfer = 1 // TODO this

  const {
    contentType,
    locked,
    name,
    earnedKoi,
    totalViews,
    imageUrl,
    txId,
    address: _ownerAddress,
    tokenAddress,
    tokenSchema
  } = info

  useEffect(() => {
    const getAddressList = async () => {
      const options = await getAddressesFromAddressBook()
      setAddressOptions(options)
    }

    getAddressList()
  }, [])

  useEffect(() => {
    // Use this wallet type since the current type is of the receipient
    const getWalletTypeAndApprovalStatus = async () => {
      const newWalletType = await popupAccount.getType(_ownerAddress)
      setWalletType(newWalletType)

      if (newWalletType !== TYPE.ETHEREUM) {
        setApprovedStatusLoaded(true)
        return
      }

      const account = await popupAccount.getAccount({ address: _ownerAddress })
      const provider = await account.get.provider()
      const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)

      const network = ethers.providers.getNetwork(ethNetwork)
      const web3 = new ethers.providers.InfuraProvider(network, apiKey)

      // const tokenContract = new web3.eth.Contract(koiTokenABI, tokenAddress)
      const tokenContract = new ethers.Contract(tokenAddress, koiTokenABI, web3)
      const koiRouterContractAddress =
        provider === ETH_NETWORK_PROVIDER.MAINNET
          ? KOI_ROUTER_CONTRACT.MAINNET
          : KOI_ROUTER_CONTRACT.GOERLI

      // const isApproved = await tokenContract.methods
      //   .isApprovedForAll(_ownerAddress, koiRouterContractAddress)
      //   .call()
      const isApproved = await tokenContract.isApprovedForAll(
        _ownerAddress,
        koiRouterContractAddress
      )
      setIsApproved(isApproved)
      setApprovedStatusLoaded(true)
    }

    getWalletTypeAndApprovalStatus()
  }, [])

  useEffect(() => {
    const estimateGas = async () => {
      if (walletType === TYPE.ETHEREUM) {
        const account = await popupAccount.getAccount({ address: _ownerAddress })
        const provider = await account.get.provider()

        const koiRouterContractAddress =
          provider === ETH_NETWORK_PROVIDER.MAINNET
            ? KOI_ROUTER_CONTRACT.MAINNET
            : KOI_ROUTER_CONTRACT.RINKEBY

        const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)

        const network = ethers.providers.getNetwork(ethNetwork)
        const web3 = new ethers.providers.InfuraProvider(network, apiKey)

        // const koiRouterContract = new web3.eth.Contract(koiRouterABI, koiRouterContractAddress)
        const koiRouterContract = new ethers.Contract(koiRouterContractAddress, koiRouterABI, web3)
        // const tokenContract = new web3.eth.Contract(koiTokenABI, tokenAddress)
        const tokenContract = new ethers.Contract(tokenAddress, koiTokenABI, web3)

        let newEstimateGasUnit = 0
        // TODO - DatH Contract.estimateGas.METHOD_NAME
        if (isApproved) {
          // newEstimateGasUnit = await koiRouterContract.methods
          //   .deposit(tokenAddress, txId, 1, address)
          //   // .estimateGas({ from: _ownerAddress, value: web3.utils.toWei('0.00015', 'ether') })
          //   .estimateGas({ from: _ownerAddress, value: ethers.utils.parseEther('0.00015') })
          newEstimateGasUnit = await koiRouterContract.estimateGas.deposit(
            tokenAddress,
            txId,
            1,
            address,
            { from: _ownerAddress, value: ethers.utils.parseEther('0.00015') }
          )
        } else {
          // newEstimateGasUnit = await tokenContract.methods
          //   .setApprovalForAll(koiRouterContractAddress, true)
          //   .estimateGas({ from: _ownerAddress })
          newEstimateGasUnit = await tokenContract.estimateGas.setApprovalForAll(
            koiRouterContractAddress,
            true,
            { from: _ownerAddress }
          )
        }

        setEstimateGasUnit(newEstimateGasUnit)
      }
    }

    estimateGas()
  }, [walletType, isApproved])

  useEffect(() => {
    const getCurrentGasPrice = async () => {
      if (walletType === TYPE.ETHEREUM && !isBridging) {
        const account = await popupAccount.getAccount({ address: _ownerAddress })
        const provider = await account.get.provider()

        const { ethNetwork, apiKey } = clarifyEthereumProvider(provider)

        const network = ethers.providers.getNetwork(ethNetwork)
        const web3 = new ethers.providers.InfuraProvider(network, apiKey)

        // const currentGasPrice = await web3.eth.getGasPrice()
        const currentGasPrice = await web3.getGasPrice()
        setCurrentGasPrice(currentGasPrice)
      }
    }

    getCurrentGasPrice()
    const intervalId = setInterval(() => {
      getCurrentGasPrice()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [walletType, isApproved, isBridging])

  useEffect(() => {
    // const currentGasBN = Web3.utils.toBN(currentGasPrice)
    const currentGasBN = ethers.BigNumber.from(currentGasPrice)
    // const newTotalGas = Web3.utils.fromWei(currentGasBN.muln(estimateGasUnit))
    const newTotalGas = ethers.utils.formatEther(currentGasBN.mul(estimateGasUnit))

    setTotalGasCost(newTotalGas)
  }, [currentGasPrice, estimateGasUnit])

  const onAddressInputChange = (e) => {
    // handle input and dropdown
    setAddress(e.target.value)
    setChosenAccount({ address: e.target.value })
  }

  const onAddressDropdownChange = (account) => {
    if (isEmpty(account)) {
      setAddress('')
      addressInputRef.current.focus()
    } else {
      setAddress(account.address)
      setChosenAccount(account)
    }

    setIsShowDropdown(false)
  }

  const onNumberTransferChange = (e) => {
    const number = e.target.value
    if (number > totalTransfer) {
      setNumberTransfer(totalTransfer)
    } else {
      setNumberTransfer(number)
    }
  }

  const onOneClick = () => {
    const account = find(accounts, (account) => account.address === _ownerAddress)

    if (isEmpty(chosenAccount) || isEmpty(chosenAccount.address)) {
      dispatch(setError(chrome.i18n.getMessage('emptySelectAddressError')))
      return
    }

    if (type === TYPE.ARWEAVE) {
      if (!isArweaveAddress(chosenAccount.address)) {
        dispatch(setError(chrome.i18n.getMessage('invalidARAddress')))
        return
      }
    }

    if (type === TYPE.ETHEREUM) {
      if (!isEthereumAddress(chosenAccount.address)) {
        dispatch(setError(chrome.i18n.getMessage('invalidETHAddress')))
        return
      }
    }

    if (!numberTransfer || numberTransfer == 0) {
      dispatch(setError(chrome.i18n.getMessage('emptyNumberOfTransferError')))
      return
    }

    if (account?.balance < 0.000001 || account?.koiBalance < 10) {
      dispatch(setError(chrome.i18n.getMessage('notEnoughARorKoiiTokens')))
      return
    }

    setStep(step + 1)
  }

  const onConfirm = async () => {
    try {
      setIsBridging(true)

      const result = await backgroundRequest.gallery.transferNFT({
        senderAddress: _ownerAddress,
        targetAddress: address,
        txId: txId,
        numOfTransfers: numberTransfer,
        tokenAddress,
        tokenSchema
      })
      /* 
        manually update state
      */
      if (result) {
        const nfts = assets.nfts.map((nft) => {
          if (nft.txId === txId) nft.isBridging = true
          return nft
        })
        dispatch(setAssets({ nfts }))
        setStep(step + 1)
      }
      setIsBridging(false)
    } catch (error) {
      setIsBridging(false)
      console.log('ERROR', error)
      if (error.message === chrome.i18n.getMessage('nftNotExistOnChain')) {
        dispatch(setError(chrome.i18n.getMessage('nftNotExistOnChain')))
      } else {
        dispatch(setError(chrome.i18n.getMessage('bridgeNftFailed')))
      }
    }
  }

  const handleSetApproval = async () => {
    try {
      setSettingApproval(true)

      // Using this same function as tranfering, since the logic is all handled by the backend
      await backgroundRequest.gallery.transferNFT({
        senderAddress: _ownerAddress,
        targetAddress: address,
        txId: txId,
        numOfTransfers: numberTransfer,
        tokenAddress,
        tokenSchema
      })

      setIsApproved(true)
      setSettingApproval(false)
    } catch (error) {
      setSettingApproval(false)
      dispatch(setError(chrome.i18n.getMessage('somethingWentWrong')))
    }
  }

  const onGoBack = () => {
    if (step == TRANSFER_STEPS.INPUT_INFO) {
      onClose()
    } else {
      setStep(step - 1)
    }
  }

  return (
    <>
      <div className="transfer-wallet-modal">
        {locked === undefined && type === TYPE.ETHEREUM ? (
          <div className="unsupported-nft">
            {chrome.i18n.getMessage('bridgeNFTNotSupportedStart')}
            <span
              style={{ textDecoration: 'underline' }}
              data-for="cannot-bridge"
              data-tip={chrome.i18n.getMessage('createdInOct2021Lc')}
            >
              {chrome.i18n.getMessage('bridgeNFTNotSupportedEndLc')}
            </span>
            <ReactTooltip place="top" id="cannot-bridge" type="dark" effect="float" />
          </div>
        ) : (
          <>
            {type === TYPE.ARWEAVE && (
              <>
                {TITLES_AR[step]}
                {DESCRIPTIONS_AR[step]}
              </>
            )}
            {type === TYPE.ETHEREUM && (
              <>
                {TITLES_ETH[step]}
                {DESCRIPTIONS_ETH[step]}
              </>
            )}

            <div className="content">
              <div className="left">
                {(includes(contentType, 'image') || includes(contentType, 'svg+xml')) && (
                  <img src={imageUrl} className="nft-img" />
                )}
                {includes(contentType, 'video') && (
                  <video
                    width={320}
                    height={240}
                    src={imageUrl}
                    className="nft-img"
                    controls
                    autoPlay
                  />
                )}
                {includes(contentType, 'html') && (
                  <div className="nft-img-iframe">
                    <div className="iframe-wrapper">
                      <iframe frameBorder="0" src={imageUrl} />
                    </div>
                  </div>
                )}
                <div className="name">{name}</div>
                {type === TYPE.ETHEREUM && (
                  <div className="views">
                    {totalViews}
                    {' ' +chrome.i18n.getMessage('viewLc')}
                  </div>
                )}
                {type === TYPE.ETHEREUM && (
                  <div className="earned-koi">
                    <FinnieIcon />
                    {formatNumber(earnedKoi)} KOII {chrome.i18n.getMessage('earnedLc')}
                  </div>
                )}
              </div>

              <div className="right">
                {step == TRANSFER_STEPS.INPUT_INFO && (
                  <>
                    <div className="eth-address">
                      {type === TYPE.ETHEREUM && (
                        <>
                          <label className="label">ETH {chrome.i18n.getMessage('address')}</label>
                          <EthereumLogo className="input-logo" />
                        </>
                      )}
                      {type === TYPE.ARWEAVE && (
                        <>
                          <label className="label">AR {chrome.i18n.getMessage('address')}</label>
                          <ArweaveLogo className="input-logo" />
                        </>
                      )}
                      <input
                        ref={(ip) => (addressInputRef.current = ip)}
                        value={address}
                        onChange={onAddressInputChange}
                        className="input"
                        placeholder={chrome.i18n.getMessage('selectConnectedWallets')}
                      />
                      <div className="address-dropdown">
                        <div
                          className="dropdown-button"
                          onClick={() => setIsShowDropdown((isShowDropdown) => !isShowDropdown)}
                        ></div>
                        {isShowDropdown && (
                          <AddressDropdown
                            accounts={[...accounts, ...addressOptions]}
                            onChange={onAddressDropdownChange}
                            type={type}
                          />
                        )}
                      </div>
                    </div>
                    <div className="number-to-transfer">
                      <div className="total-available">
                        {chrome.i18n.getMessage('totalAvailableLc')}:&nbsp; {totalTransfer}
                      </div>
                      <label className="label">{chrome.i18n.getMessage('numberToTransfer')}:</label>
                      <StackIcon className="input-logo" />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        max={totalTransfer}
                        value={numberTransfer}
                        onChange={onNumberTransferChange}
                        disabled={true}
                        className="input"
                      />
                      <div className="description-one-item">
                        {chrome.i18n.getMessage('nftOnlyHave1ItemMinted')}
                      </div>
                    </div>
                  </>
                )}

                {step == TRANSFER_STEPS.CONFIRM && (
                  <>
                    <div className="send-to">
                      <div className="label">{chrome.i18n.getMessage('sendingTo')}:</div>
                      <div className="account">
                        {type === TYPE.ARWEAVE && <ArweaveLogo className="account-logo" />}
                        {type === TYPE.ETHEREUM && <EthereumLogo className="account-logo" />}
                        <div className="info">
                          {chosenAccount.accountName && (
                            <div className="name">{chosenAccount.accountName}</div>
                          )}
                          <div className="address">{chosenAccount.address}</div>
                        </div>
                      </div>
                    </div>

                    <div className="warning">
                      <WarningIcon className="warning-icon" />
                      <div className="warning-text">
                        {chrome.i18n.getMessage('makeSureCorrectAddressExportNFT')}
                      </div>
                    </div>

                    <div className="number-to-transfer confirm">
                      <div className="total-available">
                        {chrome.i18n.getMessage('totalAvailableLc')}:&nbsp; {totalTransfer}
                      </div>
                      <StackWhiteIcon className="logo" />
                      <div>
                        <span>{chrome.i18n.getMessage('transfer')}</span> {numberTransfer}{' '}
                        {chrome.i18n.getMessage('edition')}
                      </div>
                    </div>
                  </>
                )}

                {step == TRANSFER_STEPS.SUCCESS && (
                  <>
                    <div className="number-to-transfer success">
                      <div>
                        {' '}
                        {numberTransfer} {chrome.i18n.getMessage('edition')}
                      </div>
                    </div>

                    <div className="send-to">
                      <div className="account">
                        <div className="info">
                          {chosenAccount.accountName && (
                            <div className="name">{chosenAccount.accountName}</div>
                          )}
                          <div className="address">{chosenAccount.address}</div>
                        </div>
                      </div>
                    </div>

                    <div className="transaction-pending">
                      {chrome.i18n.getMessage('transactionPendingLc')}
                    </div>

                    <div className="complete-tip">
                      {chrome.i18n.getMessage('exportNFTCompleteMsg')}
                    </div>
                  </>
                )}

                {step != TRANSFER_STEPS.SUCCESS &&
                  (type !== TYPE.ARWEAVE ? (
                    <div className="estimate-cost">
                      <div className="text">{chrome.i18n.getMessage('estimatedCosts')}:</div>
                      <div className="number">
                        <div className="koi-number">10 KOII</div>
                      </div>
                    </div>
                  ) : (
                    <div className="estimate-cost--eth">
                      {isApproved && (
                        <div className="cost">
                          <span>{chrome.i18n.getMessage('cost')}:</span>
                          <span>0.000150 ETH</span>
                        </div>
                      )}
                      <div className="cost">
                        <div
                          className="question-mark-icon"
                          data-tip={chrome.i18n.getMessage('gasEstimateDesc')}
                          data-for="gas-estimate-note"
                        >
                          <QuestionIcon />
                        </div>
                        <span>{chrome.i18n.getMessage('gasEstimate')}:</span>
                        <span>{formatNumber(totalGasCost, 6)} ETH</span>
                      </div>
                      <div className="estimate-note">{'update in < 30 sec.'}</div>
                      <div className="total-cost">
                        <span>{chrome.i18n.getMessage('gasEstimate')}: </span>
                        <span className="total-number">
                          {isApproved
                            ? formatNumber(Number(totalGasCost) + 0.00015, 6)
                            : formatNumber(Number(totalGasCost), 6)}{' '}
                          ETH
                        </span>
                      </div>
                    </div>
                  ))}

                {step == TRANSFER_STEPS.INPUT_INFO && (
                  <>
                    {type === TYPE.ARWEAVE && !isApproved && (
                      <button
                        className="transfer-button"
                        onClick={handleSetApproval}
                        disabled={settingApproval || !approvedStatusLoaded}
                      >
                        {settingApproval ? 'Setting approval...' : 'Set approval for all'}
                      </button>
                    )}
                    {type === TYPE.ARWEAVE && isApproved && (
                      <button className="transfer-button" onClick={onOneClick}>
                        {chrome.i18n.getMessage('oneClickTransfer')} AR
                      </button>
                    )}
                    {type === TYPE.ETHEREUM && (
                      <button className="transfer-button" onClick={onOneClick}>
                        {chrome.i18n.getMessage('oneClickTransfer')} ETH
                      </button>
                    )}
                  </>
                )}

                {step == TRANSFER_STEPS.CONFIRM && (
                  <button className="transfer-button" onClick={onConfirm} disabled={isBridging}>
                    {isBridging
                      ? chrome.i18n.getMessage('bridgingYourNFT')
                      : type === TYPE.ARWEAVE
                        ? chrome.i18n.getMessage('confirmTransferTo') + ' AR'
                        : chrome.i18n.getMessage('confirmTransferTo') + ' ETH'}
                  </button>
                )}

                {/* {step == TRANSFER_STEPS.SUCCESS && (
              <div className='transfer-button success' onClick={onSeeActivity}>
                See My Activity
              </div>
            )} */}
              </div>
            </div>
          </>
        )}
        <div className="goback-button" data-tip={chrome.i18n.getMessage('back')} onClick={onGoBack}>
          <GoBackIcon />
        </div>
        <div className="foot-note">{chrome.i18n.getMessage('betaFeature')}</div>
      </div>
      <ReactTooltip place="top" type="dark" effect="float" />
      <ReactTooltip
        id="gas-estimate-note"
        border={true}
        className="gas-estimate-note-tooltip"
        multiline={true}
        place="left"
        effect="float"
      />
    </>
  )
}
