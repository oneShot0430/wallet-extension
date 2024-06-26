import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { PATH } from 'constants/koiConstants'
import EmailIcon from 'img/social/email-icon.svg'
import FacebookIcon from 'img/social/facebook-icon.svg'
import LinkedInIcon from 'img/social-icons/linkedin-icon.svg'
import TwitterIcon from 'img/social-icons/twitter-icon.svg'
import Modal from 'options/shared/modal'

import { createShareWindow } from '../../helpers'

import './index.css'

const TextBox = ({ title, text, buttonText, url }) => {
  const [isCopied, setIsCopied] = useState(false)

  const onCopy = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <div className="share-nft text-box">
      <div className="share-nft text-box title">{title}</div>
      <div className="share-nft text-box content">
        <input className="share-nft text-box text" disabled value={text} />
        <CopyToClipboard text={url}>
          <button onClick={onCopy} className="share-nft text-box btn">
            {buttonText}
          </button>
        </CopyToClipboard>
      </div>
      {isCopied && <div className="copy-noti">{chrome.i18n.getMessage('linkCopied')}</div>}
    </div>
  )
}

const ShareNFT = ({ txid }) => {
  const shareUrl = `${PATH.KOII_LIVE}/${txid}.html`
  const embedUrl = `<iframe width="100%" src="https://koi.rocks/embed/${txid}" title="Koii NFT image" frameborder="0" allowfullscreen></iframe>`

  return (
    <div className="share-nft container">
      {txid ? (
        <>
          <div className="share-nft title container">
            {chrome.i18n.getMessage('shareToEarn')}
          </div>
          <div className="share-nft text-box container">
            <TextBox
              txid={txid}
              text={shareUrl}
              url={shareUrl}
              title="Share:"
              buttonText={chrome.i18n.getMessage('getShareLinkLc')}
            />
            <TextBox
              txid={txid}
              text={embedUrl}
              url={embedUrl}
              title="Embed:"
              buttonText={chrome.i18n.getMessage('getEmbedLinkLc')}
            />
          </div>
          <div className="share-nft social-icon container">
            <div className="icon">
              <TwitterIcon
                onClick={() => {
                  createShareWindow('twitter', txid)
                }}
              />
            </div>
            <div className="icon">
              <FacebookIcon
                onClick={() => {
                  createShareWindow('facebook', txid)
                }}
              />
            </div>
            {/* <div className="icon">
              <LinkedInIcon
                onClick={() => {
                  createShareWindow('linkedin', txid)
                }}
              />
            </div> */}
            <a
              href={`mailto:?subject=Check out my NFT, now stored on Koii— forever!&body=https://koii.live/content-detail/${txid}`}
              title={chrome.i18n.getMessage('shareByEmail')}
            >
              <EmailIcon />
            </a>
          </div>
        </>
      ) : (
        <div className="share-nft title container">
          {chrome.i18n.getMessage('somethingWrongNFT')}
        </div>
      )}
    </div>
  )
}

export default ({ onClose, txid }) => {
  return (
    <div>
      <Modal onClose={onClose}>
        <ShareNFT txid={txid} />
      </Modal>
    </div>
  )
}
