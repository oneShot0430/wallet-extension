import React, { useContext, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { TYPE } from 'constants/accountConstants'
import { FRIEND_REFERRAL_ENDPOINTS, STATEMENT } from 'constants/koiConstants'
import CheckMarkIcon from 'img/v2/check-mark-icon-blue.svg'
import CopyIcon from 'img/v2/copy-icon.svg'
import FriendReferralBg from 'img/v2/friend-referral-bg.svg'
import ShareCodeIcon from 'img/v2/share-code-icon.svg'
import ShareIcon from 'img/v2/share-icon.svg'
import ShuttleIcon from 'img/v2/shuttle-icon.svg'
import get from 'lodash/get'
import { setError } from 'options/actions/error'
import { setIsLoading, setLoaded } from 'options/actions/loading'
import { setQuickNotification } from 'options/actions/quickNotification'
import Button from 'options/components/Button'
import NavBar from 'options/components/NavBar'
import ToolTip from 'options/components/ToolTip'
import { getDisplayingAccount } from 'options/selectors/displayingAccount'
import { popupBackgroundRequest as backgroundRequest } from 'services/request/popup'

import GetRewardsModal from './GetRewardsModal'
import ShareCodeModal from './ShareCodeModal'

const FriendReferral = () => {
  const dispatch = useDispatch()

  const displayingAccount = useSelector(getDisplayingAccount)

  const [isCopied, setIsCopied] = useState(false)
  const [showGetRewardsModal, setShowGetRewardsModal] = useState(false)
  const [showShareCodeModal, setShowShareCodeModal] = useState(false)

  const defaultAccount = useSelector((state) => state.defaultAccount.AR)
  const code = defaultAccount.affiliateCode

  const redeemRewards = async () => {
    try {
      dispatch(setIsLoading)
      if (defaultAccount) {
        const { message, status } = await backgroundRequest.gallery.friendReferral({
          endpoints: FRIEND_REFERRAL_ENDPOINTS.CLAIM_REWARD
        })

        if (status != 200) {
          switch (message) {
            case `Affiliate Invites doesn't exists or already claimed`:
              dispatch(setQuickNotification(chrome.i18n.getMessage('statementNoReward')))
              break
            default:
              dispatch(setQuickNotification(message))
          }
        } else {
          console.log('RECEIVED KOII')
        }
      }
    } catch (err) {
      dispatch(setError(err.message))
    }
    dispatch(setLoaded)
  }

  return (
    <div className="w-full min-h-screen h-full bg-blue-600">
      <NavBar />
      <div className="absolute w-full mx-auto">
        <FriendReferralBg className="ml-9" />
      </div>
      <div className="mt-16.75 mx-auto transform -translate-x-83 w-max text-white">
        <div className="font-semibold text-3xl leading-10 capitalize">
          {chrome.i18n.getMessage('giveLittleGetLittle')}
        </div>
        <div className="w-80 mt-5 leading-7 text-base">
          {chrome.i18n.getMessage('friendReferralMsg')}
        </div>
        <div className="w-80 mt-18 leading-7 text-base">
          {chrome.i18n.getMessage('youHaveEarned')}{' '}
          <span className="text-success">{defaultAccount.totalReward} KOII</span>{' '}
          {chrome.i18n.getMessage('withYourReferralCodeLc')}{'. '}
          <span className="font-semibold">{chrome.i18n.getMessage('keepSharing')}</span>
        </div>
      </div>
      <div className="m-auto absolute top-48 left-0 right-0 bottom-0">
        <ShuttleIcon
          style={{ width: '182px', height: '293px', animation: 'spin 8s linear infinite' }}
          className="mx-auto"
        />
        <div className="mt-8 text-success text-lg leading-7 font-semibold text-center">
          {chrome.i18n.getMessage('yourCodeIsUc')}
        </div>
        <div className="mt-2 text-base text-center leading-7 text-white">{code}</div>
        <div style={{ width: '768px' }} className="mt-8 flex justify-evenly items-center mx-auto">
          <span data-tip={chrome.i18n.getMessage('onlyARSupports')}>
            <Button
              style={{ width: '216px', height: '46px' }}
              text={chrome.i18n.getMessage('shareCode')}
              variant="lightBlue"
              icon={ShareCodeIcon}
              size="lg"
              onClick={() => {
                setShowShareCodeModal(true)
              }}
              disabled={get(displayingAccount, 'type') !== TYPE.ARWEAVE}
            />
          </span>

          <span data-tip={chrome.i18n.getMessage('onlyARSupports')}>
            <CopyToClipboard text={code}>
              <Button
                style={{ width: '216px', height: '46px' }}
                text={isCopied ? chrome.i18n.getMessage('copied') : chrome.i18n.getMessage('clickToCopy')}
                variant="primary"
                icon={isCopied ? CheckMarkIcon : CopyIcon}
                size={isCopied ? 'lg' : 'md'}
                onClick={() => setIsCopied(true)}
                disabled={get(displayingAccount, 'type') !== TYPE.ARWEAVE}
              />
            </CopyToClipboard>
          </span>

          <span data-tip={chrome.i18n.getMessage('onlyARSupports')}>
            <Button
              style={{ width: '216px', height: '46px' }}
              text={chrome.i18n.getMessage('getMyRewards')}
              variant="warning300"
              icon={ShareIcon}
              size="lg"
              onClick={() => {
                setShowGetRewardsModal(true)
              }}
              disabled={get(displayingAccount, 'type') !== TYPE.ARWEAVE}
            />
          </span>
        </div>
      </div>
      {showGetRewardsModal && (
        <GetRewardsModal
          redeemRewards={redeemRewards}
          rewards={defaultAccount.totalReward}
          close={() => setShowGetRewardsModal(false)}
        />
      )}
      {showShareCodeModal && (
        <ShareCodeModal code={code} close={() => setShowShareCodeModal(false)} />
      )}
      {get(displayingAccount, 'type') !== TYPE.ARWEAVE && <ToolTip />}
    </div>
  )
}

export default FriendReferral
