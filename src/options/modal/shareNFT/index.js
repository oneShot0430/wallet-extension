import React, { useState } from 'react'
import Modal from 'options/shared/modal'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import './index.css'

import TwitterIcon from 'img/social-icons/twitter-icon.svg'
import FacebookIcon from 'img/social/facebook-icon.svg'
import EmailIcon from 'img/social/email-icon.svg'
import LinkedInIcon from 'img/social/linkedin-icon.svg'

import { createShareWindow } from '../../helpers'

const TextBox = ({title, text, buttonText, url}) => {
  const [isCopied, setIsCopied] = useState(false)

  const onCopy = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <div className='share-nft text-box'>
      <div className='share-nft text-box title'>{title}</div>
      <div className='share-nft text-box content'>
        <input className='share-nft text-box text' disabled value={text}/>
        <CopyToClipboard text={url}>
          <button onClick={onCopy} className='share-nft text-box btn'>{buttonText}</button>
        </CopyToClipboard>
        
      </div>
      {isCopied && <div className='copy-noti'>Link copied!</div>}
    </div>
  )
}

const ShareNFT = ({ txid }) => {
  const shareUrl = `https://koi.rocks/content-detail/${txid}`
  const embedUrl = `<iframe width="100%" src="https://koi.rocks/embed/${txid}" title="Koi NFT image" frameborder="0" allowfullscreen></iframe>`

  return (
    <div className='share-nft container'>
      <div className='share-nft title container'>
        Share to earn Attention Rewards
      </div>
      <div className='share-nft text-box container'>
        <TextBox txid={txid} text={shareUrl} url={shareUrl} title='Share:' buttonText='get share link'/>
        <TextBox txid={txid} text={embedUrl} url={embedUrl} title='Embed:' buttonText='get embed link'/>
      </div>
      <div className='share-nft social-icon container'>
        <div onClick={() => { createShareWindow('twitter', txid) }}><TwitterIcon /></div>
        <FacebookIcon onClick={() => { createShareWindow('facebook', txid) }}/>
        <LinkedInIcon onClick={() => { createShareWindow('linkedin', txid) }}/>
        <a href={`mailto:?subject=Check out my NFT, now stored on Koi— forever!&body=https://koi.rocks/content-detail/${txid}`} title="Share by Email">
          <EmailIcon />
        </a>
      </div>
    </div>
  )
}

export default ({ onClose, txid }) => {
  return (
    <div>
      <Modal onClose={onClose}><ShareNFT txid={txid}/></Modal>
    </div>
  )
}