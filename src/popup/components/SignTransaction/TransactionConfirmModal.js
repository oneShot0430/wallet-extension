// modules
import React, { useEffect, useMemo,useState } from 'react'
import { connect,useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { setError } from 'actions/error'
import { setIsLoading } from 'actions/loading'
import clsx from 'clsx'
import { TYPE } from 'constants/accountConstants'
import BackBtn from 'img/popup/back-button.svg'
import CheckMarkIcon from 'img/popup/check-mark-icon.svg'
import WarningIcon from 'img/popup/close-icon-red.svg'
import WaitingIcon from 'img/popup/waiting-icon.svg'
import WarningRedIcon from 'img/popup/warning-icon-red.svg'
import ArweaveIcon from 'img/v2/arweave-logos/arweave-logo.svg'
import CloseIcon from 'img/v2/close-icon-white.svg'
import EthereumIcon from 'img/v2/ethereum-logos/ethereum-logo.svg'
import FinnieIcon from 'img/v2/koii-logos/finnie-koii-logo-blue.svg'
import OkBtn from 'img/v2/popup-tx-detail-ok.svg'
import SunriseLogo from 'img/v2/sunrise-logo/sunrise-logo.svg'
import ViewBlockIcon from 'img/v2/view-block.svg'
import { get, isEmpty, isNumber } from 'lodash'
import { getDisplayAddress } from 'options/utils'
// styles
// import './index.css'
import { popupAccount } from 'services/account'
import arweave from 'services/arweave'
import storage from 'services/storage'
// utils
import { calculateGasFee, fiatCurrencyFormat, numberFormat, winstonToAr } from 'utils'
import { decodeTxMethod } from 'utils/index'
import Web3 from 'web3'

import ConnectScreen from 'components/Connect/ConnectScreen'

import { TAB, TRANSACTION_METHOD,TRANSACTION_TYPE } from './hooks/constants'
import useExploreBlockUrl from './hooks/useExploreBlockUrl'
import useGetFee from './hooks/useGetFee'
import useLoadRequest from './hooks/useLoadRequest'
import useMethod from './hooks/useMethod'
import useSecurityStatus from './hooks/useSecurityStatus'
import useSendValue from './hooks/useSendValue'
import useSimulation from './hooks/useSimulation'

const TransactionConfirmModal = ({ onClose, setIsLoading, setError, setShowSigning }) => {
  const [tab, setTab] = useState(TAB.DETAIL)
  const [showReceipt, setShowReceipt] = useState(false)
  const [txId, setTxId] = useState('')
  const [showConnectedSites, setShowConnectedSites] = useState(false)
  const [acceptSite, setAcceptSite] = useState(false)

  const price = useSelector((state) => state.price)
  const {
    transactionPayload,
    network,
    origin,
    requestId,
    favicon,
    transactionType,
    dataString,
    senderName,
    recipientName,
    signWithoutSend
  } = useLoadRequest({ setIsLoading })

  const trustStat = useSecurityStatus({ setIsLoading, url: origin })

  const { exploreBlockUrl } = useExploreBlockUrl({ transactionPayload })

  const { Fee, tokenSymbol, totalFee, getFeeInterval } = useGetFee({ network, transactionPayload })

  useSimulation({ network, transactionPayload })

  const sender = useMemo(() => {
    return get(transactionPayload, 'from')
  }, [transactionPayload])

  const contractId = useMemo(() => {
    if (transactionType !== TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER)
      return get(transactionPayload, 'to')
    return null
  }, [transactionType])

  const transactionMethod = useMemo(() => {
    if (transactionType === TRANSACTION_TYPE.CONTRACT_INTERACTION && !isEmpty(dataString)) return decodeTxMethod(dataString)
    return null
  }, [dataString])

  const {
    SendValue,
    TokenIcon,
    customTokenRecipient,
    contractAddress,
    value,
    rawValue,
    balance,
    symbol,
    originBalance,
    originSymbol
  } = useSendValue({
    network,
    transactionPayload,
    transactionType,
    setIsLoading,
    userAddress: sender
  })

  const { onSubmitTransaction, onRejectTransaction } = useMethod({
    setIsLoading,
    requestId,
    setError,
    setShowSigning,
    transactionPayload,
    network,
    transactionType,
    contractAddress,
    value,
    rawValue,
    customTokenRecipient,
    setTxId,
    setShowReceipt,
    getFeeInterval,
    totalFee
  })

  const recipient = useMemo(() => {
    if (customTokenRecipient) return customTokenRecipient
    return get(transactionPayload, 'to')
  }, [customTokenRecipient, transactionPayload])

  const isScamOrigin = useMemo(() => {
    return isNumber(trustStat) && trustStat < 0 && !acceptSite
  }, [trustStat, acceptSite])

  useEffect(() => {
    return () => {
      storage.generic.set.pendingRequest({})
    }
  }, [])

  return (
    <div className="w-full h-full bg-white z-51 m-auto top-0 left-0 fixed flex flex-col justify-center items-center">
      {!showReceipt ? (
        <div className="w-full h-full relative bg-white shadow-md rounded m-auto flex flex-col items-center">
          <div className="w-full flex flex-col">
            {/* TOP BUTTONS */}
            {/* <div
              className="relative bg-blue-800 w-full flex items-center justify-center"
              style={{ height: '67px' }}
            >
              <div className="font-semibold text-xl text-white leading-6 text-center tracking-finnieSpacing-wide">
                Confirm Transaction
              </div>
            </div> */}

            {/* NAVIGATION TAB */}
            <div className="w-full grid grid-cols-2 text-base text-indigo">
              <div
                style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.16)' }}
                className={clsx(
                  'h-9.5 flex justify-center items-center cursor-pointer',
                  tab === TAB.DETAIL && 'bg-lightBlue font-semibold'
                )}
                onClick={() => setTab(TAB.DETAIL)}
              >
                Details
              </div>
              <div
                style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.16)' }}
                className={clsx(
                  'h-9.5 flex justify-center items-center cursor-pointer',
                  tab === TAB.DATA && 'bg-lightBlue font-semibold',
                  isEmpty(dataString) && 'cursor-not-allowed'
                )}
                onClick={() => {
                  if (!isEmpty(dataString)) setTab(TAB.DATA)
                }}
                // data-tip={isEmpty(dataString) ? `This transaction doesn't contain data` : ''}
              >
                Data
              </div>
            </div>
          </div>

          {/* TRANSACTION DATA */}
          {tab === TAB.DATA && (
            <div
              className="flex flex-col w-full px-4.5 pb-20 my-auto font-normal text-xs leading-6 tracking-finnieSpacing-wide text-indigo"
              style={{ height: '348px' }}
            >
              <div>HEX DATA: </div>
              <div
                className="mt-4 h-56 w-full break-words overflow-y-scroll"
                style={{
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.16)',
                  padding: '12px'
                }}
              >
                {dataString}
              </div>
              <div className="mt-10 font-semibold text-sm leading-5">Contract ID</div>
              {contractId && <div className="mt-1.5 leading-4">{contractId}</div>}
            </div>
          )}

          {/* TRANSACTION DETAIL */}
          {tab === TAB.DETAIL && (
            // <div className="flex flex-col items-center w-full h-full px-9 mt-2 mb-22 overflow-y-scroll overflow-x-hidden">
            <div className="flex flex-col items-center w-full h-full mt-2 mb-22 overflow-y-auto overflow-x-hidden">
              {/* <div className="w-full mt-5 text-base leading-6 tracking-finnieSpacing-wide text-indigo text-center">
                {origin}
              </div> */}
              <BackBtn
                onClick={onRejectTransaction}
                className="w-7.5 h-7.5 z-20 absolute top-15 left-3.75 cursor-pointer bg-white bg-opacity-70 rounded-full"
              />
              <div className="mt-5 font-semibold text-base text-indigo leading-5 text-center tracking-finnieSpacing-wide">
                Confirm Transaction
              </div>
              {/* TRANSACTION TITLE */}
              <div className="mt-4.5 font-semibold text-sm text-indigo text-center tracking-finnieSpacing-wide">
                {transactionType === TRANSACTION_TYPE.CONTRACT_DEPLOYMENT && 'Contract Deployment'}
                {transactionType === TRANSACTION_TYPE.CONTRACT_INTERACTION &&
                  'Contract Interaction'}
                {transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER &&
                  network === 'ETHEREUM' &&
                  'Transfer ETH'}
                {transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER &&
                  network === 'ARWEAVE' &&
                  'Transfer AR'}
                {transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER && 'Transfer Token'}
              </div>
              {transactionType === TRANSACTION_TYPE.CONTRACT_INTERACTION &&
                !isEmpty(transactionMethod) && (
                  <>
                    {transactionMethod === TRANSACTION_METHOD.SET_APPROVAL_FOR_ALL && (
                      <div className="flex items-center justify-center w-auto h-5 mt-1 mb-3 px-1 text-sm text-indigo font-semibold tracking-finnieSpacing-wide border border-turquoiseBlue rounded-xs bg-cyan">
                        setApprovalForAll
                      </div>
                    )}
                    {transactionMethod === TRANSACTION_METHOD.MINT_COLLECTIBLES && (
                      <div className="flex items-center justify-center w-auto h-5 mt-1 mb-3 px-1 text-sm text-indigo font-semibold tracking-finnieSpacing-wide border border-turquoiseBlue rounded-xs bg-cyan">
                        mintCollectibles
                      </div>
                    )}
                    {transactionMethod === TRANSACTION_METHOD.APPROVE && (
                      <div className="flex items-center justify-center w-auto h-5 mt-1 mb-3 px-1 text-sm text-indigo font-semibold tracking-finnieSpacing-wide border border-turquoiseBlue rounded-xs bg-cyan">
                        approve
                      </div>
                    )}
                  </>
              )}
              {/* NFT SECURITY */}
              {isNumber(trustStat) &&
                (trustStat === 2 ? (
                  <div
                    className="w-full mt-3 flex items-center justify-center text-indigo bg-success bg-opacity-50 text-xs font-normal"
                    // style={{ width: '426px', height: '36px' }}
                    style={{ height: '36px' }}
                  >
                    <CheckMarkIcon style={{ width: '24px', height: '24px' }} />
                    <div className="mx-2" style={{ width: '300px ' }}>
                      Website verified by Sunrise NFT Scam Detector
                    </div>
                    <SunriseLogo style={{ width: '21px', height: '21px' }} />
                  </div>
                ) : 0 <= trustStat && trustStat < 2 ? (
                  <div
                    className="w-full mt-3 flex items-center justify-center text-indigo bg-warning-200 bg-opacity-50 text-xs font-normal"
                    // style={{ width: '426px', height: '45px' }}
                    style={{ height: '45px' }}
                  >
                    <WaitingIcon style={{ width: '24px', height: '24px' }} />
                    <div className="mx-2" style={{ width: '300px ' }}>
                      This website hasn’t been verified by Sunrise NFT Scam Detector. Make sure
                      you’re on the right site.
                    </div>
                    <SunriseLogo style={{ width: '21px', height: '21px' }} />
                  </div>
                ) : (
                  trustStat < 0 && (
                    <div
                      className="w-full mt-3 flex items-center justify-center text-indigo bg-warning-300 bg-opacity-50 text-xs font-normal"
                      // style={{ width: '426px', height: '106px' }}
                      style={{ height: '106px' }}
                    >
                      <WarningIcon style={{ width: '24px', height: '24px' }} />
                      <div
                        className="mx-2 flex flex-col items-center justify-center"
                        style={{ width: '300px ' }}
                      >
                        According to Sunrise NFT Scam Detector, this site might be impersonating a
                        popular NFT site. Double check that you are minting from the correct site to
                        keep your assets secure.
                        <div
                          className="leading-6 bg-blue-800 rounded-sm mt-0.5 flex items-center justify-center text-white cursor-pointer"
                          style={{ width: '100px', height: '20px' }}
                          onClick={() => setShowConnectedSites(true)}
                        >
                          I Understand
                        </div>
                      </div>
                      <SunriseLogo style={{ width: '21px', height: '21px' }} />
                    </div>
                  )
                ))}

              <div className="mt-5 px-9 w-full flex flex-col font-semibold text-sm text-indigo tracking-finnieSpacing-wide">
                {origin && (
                  <div
                    className={clsx(
                      'flex mb-2',
                      isScamOrigin && 'text-red-finnie'
                    )}
                  >
                    <div style={{ width: '176px' }}>Origin</div>
                    <div
                      className={clsx(
                        'flex font-normal text-xs items-center truncate',
                        isScamOrigin && 'text-red-finnie'
                      )}
                    >
                      {origin}
                    </div>
                    {isScamOrigin && <WarningRedIcon className="w-6 h-6" />}
                  </div>
                )}
                {(transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER ||
                  transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER) && (
                  <div className="flex mb-2">
                    <div style={{ width: '176px' }}>Sending</div>
                    <div className="flex font-normal text-xs items-center">
                      <SendValue />
                      <div className="ml-1 w-4 h-4">
                        <TokenIcon />
                      </div>
                      {/* <EthereumIcon className="ml-1 w-4 h-4" /> */}
                    </div>
                  </div>
                )}
                <div className="flex mb-2">
                  <div style={{ width: '176px' }}>Total Balance</div>
                  <div className="flex font-normal text-xs items-center text-success-700">
                    {numberFormat(originBalance, 6)} {originSymbol}
                  </div>
                </div>

                {transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER &&
                  network !== 'ARWEAVE' && (
                  <div className="flex mb-2">
                    <div style={{ width: '176px' }}>Token Balance</div>
                    <div className="flex font-normal text-xs items-center text-success-700">
                      {numberFormat(balance, 6)} {symbol}
                    </div>
                  </div>
                )}

                <div className="flex">
                  <div style={{ width: '176px' }}> Transaction Fees</div>
                  <div className="flex font-normal text-xs items-center">
                    <Fee />
                  </div>
                </div>
              </div>

              <div className="mt-5 px-9 w-full flex flex-col font-semibold text-sm text-indigo tracking-finnieSpacing-wide">
                <div style={{ width: '176px' }}>From</div>
                {senderName && <div className="mt-2 font-semibold text-xs">{senderName}</div>}
                <div className="mt-2 font-normal text-xs text-success-700">
                  {get(transactionPayload, 'from')}
                </div>
              </div>

              {(transactionType === TRANSACTION_TYPE.CUSTOM_TOKEN_TRANSFER ||
                transactionType === TRANSACTION_TYPE.ORIGIN_TOKEN_TRANSFER &&
                recipient
              ) && (
                <div className="mt-5 px-9 w-full flex flex-col font-semibold text-sm text-indigo tracking-finnieSpacing-wide">
                  <div style={{ width: '176px' }}>To</div>
                  {recipientName && (
                    <div className="mt-2 font-semibold text-xs">{recipientName}</div>
                  )}
                  <div className="mt-2 font-normal text-xs text-success-700">
                    {customTokenRecipient || get(transactionPayload, 'to')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BUTTONS */}
          <div
            style={{ width: '350px' }}
            className="absolute bottom-10 w-full flex justify-between"
          >
            <button
              onClick={onRejectTransaction}
              className={clsx(
                'bg-white border-2 border-blue-800 rounded-sm shadow text-base leading-4 text-center text-blue-800',
                isScamOrigin && 'cursor-not-allowed opacity-50'
              )}
              style={{ width: '160px', height: '38px' }}
              disabled={isScamOrigin}
            >
              Reject
            </button>
            <button
              onClick={onSubmitTransaction}
              className={clsx(
                'bg-blue-800 rounded-sm shadow text-base leading-4 text-center text-white',
                isScamOrigin && 'cursor-not-allowed opacity-50'
              )}
              style={{ width: '160px', height: '38px' }}
              disabled={isScamOrigin}
            >
              {signWithoutSend ? 'Sign' : 'Send'}
            </button>
          </div>
          <ReactTooltip place="top" effect="float" />
          {showConnectedSites && (
            <ConnectScreen
              startedStep={2}
              popupConnectedModal={true}
              close={() => setShowConnectedSites(false)}
              setAcceptSite={setAcceptSite}
            />
          )}
        </div>
      ) : (
        /* RECEIPT */
        <div className="w-full relative bg-white rounded m-auto pt-9 text-blue-800 flex flex-col items-center tracking-finnieSpacing-tighter">
          <div className="font-semibold text-lg leading-5 text-indigo">
            Your tokens are on the way!
          </div>
          <div className="px-9 mt-8 w-full flex flex-col font-semibold text-sm text-indigo tracking-finnieSpacing-wide">
            {transactionType !== TRANSACTION_TYPE.CONTRACT_DEPLOYMENT &&
              transactionType !== TRANSACTION_TYPE.CONTRACT_INTERACTION && (
              <div className="flex mb-4">
                <div style={{ width: '142px' }}>Amount</div>
                <div className="flex font-normal text-sm items-center">
                  {value} {symbol}
                  <div className="ml-1 w-4 h-4">
                    <TokenIcon />
                  </div>
                </div>
              </div>
            )}
            <div className="flex mb-4">
              <div style={{ width: '142px' }}>From</div>
              <div className="flex flex-col font-normal text-sm items-start">
                {senderName && <div>{senderName}</div>}
                <div className="font-normal text-xs text-success-700">
                  {getDisplayAddress(sender, 20)}
                </div>
              </div>
            </div>
            <div className="flex mb-4">
              <div style={{ width: '142px' }}>To</div>
              <div className="flex flex-col font-normal text-sm items-start">
                {recipientName && <div>{recipientName}</div>}
                <div className="font-normal text-xs text-success-700">
                  {getDisplayAddress(recipient, 20)}
                </div>
              </div>
            </div>
            <div className="flex mb-4">
              <div style={{ width: '142px' }}>Transaction Fees</div>
              <div className="font-normal text-sm">
                {numberFormat(totalFee, 6)} {tokenSymbol}
              </div>
            </div>
            <div className="flex mb-4">
              <div style={{ width: '142px' }}>Status</div>
              <div className="font-normal text-sm">Confirmed</div>
            </div>
            <div className="flex">
              <div style={{ width: '142px' }}>Total Cost</div>
              <div className="flex flex-col font-normal text-sm items-start">
                <div className="leading-5">
                  {value} {symbol}
                </div>
                <div className="leading-5">
                  {numberFormat(totalFee)} {tokenSymbol}
                </div>
              </div>
            </div>
          </div>

          <Link onClick={() => setShowSigning(false)} className="mt-10" to="/">
            <OkBtn className="cursor-pointer" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default connect(null, { setIsLoading, setError })(TransactionConfirmModal)
