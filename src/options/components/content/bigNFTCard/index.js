import React, {
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'

import ArweaveIcon from 'img/arweave-icon.svg'
import EmailIcon from 'img/social-icons/email-icon.svg'
import FacebookIcon from 'img/social-icons/facebook-icon.svg'
import LinkedinIcon from 'img/social-icons/linkedin-icon.svg'
import TwitterIcon from 'img/social-icons/twitter-icon.svg'

import { createShareWindow } from '../../../helpers'

import { GalleryContext } from 'options/galleryContext'

import './index.css'
import { formatNumber } from '../../../utils'

export default ({
  txId,
  name,
  imageUrl,
  earnedKoi,
  isRegistered,
  koiRockUrl,
  setChoosen,
  contentType,
  totalViews,
  createdAt,
}) => {
  const { setShowExportModal, setShowShareModal } = useContext(GalleryContext)

  const { registeredDate, description, tags } = {
    registeredDate: moment(createdAt * 1000).format('MMMM Do, YYYY'),
    description:
      'It is a long established fact that a reader will long established fact that a reader will long established fact that a reader will It is a long established fact that a reader will It is a long established fact that a reader willIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using It is a long established fact that a reader will long established fact that a reader will long established fact that a reader will It is a long established fact that a reader will It is a long established fact that a reader willIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using',
    tags: ['crypto', 'puppies', 'electropop', 'cubism'],
  }

  return (
    <div className='big-nft-card-wrapper'>
      <div className='big-nft-card'>
        <div className='nft-preview'>
          {contentType.includes('image') ? (
            <img src={imageUrl} className='nft-img' />
          ) : (
            <video
              width={320}
              height={240}
              src={imageUrl}
              className='nft-img'
              controls
              autoPlay
            />
          )}
        </div>
        <div className='info'>
          <div className='nft-name'>{name}</div>
          <div className='export-nft'>
            <ArweaveIcon className='arweave-icon' />
            Export this NFT to a&nbsp;
            <span
              onClick={() => {
                setShowExportModal(true)
              }}
              className='different-chain'
            >
              different chain
            </span>
            .
          </div>
          <div className='registered-date'>Registered: {registeredDate}</div>
          <div className='external-links'>
            <a
              className='external-link'
              href={`https://viewblock.io/arweave/tx/${txId}`}
              target='_blank'
            >
              explore block
            </a>
            <a className='external-link' href={koiRockUrl} target='_blank'>
              koi.rocks
            </a>
          </div>
          <div className='description'>{description}</div>
          {/* <div className='tags'>
            {tags.map((tag, index) => (
              <div key={index} className='tag-item'>
                {tag}
              </div>
            ))}
          </div> */}
          <div className='earned'>
            <div className='views'>
              {totalViews} {totalViews > 1 ? 'views' : 'view'}
            </div>
            <div className='koi '>{formatNumber(earnedKoi)} KOI earned</div>
          </div>
          <div className='share-embed'>
            <button
              className='share-button'
              onClick={() => {
                setShowShareModal({ show: true, txid: txId })
              }}
            >
              Share
            </button>
            <button className='embed-button'>Embed</button>
          </div>
          <div className='social-icons'>
            <TwitterIcon onClick={() => { createShareWindow('twitter', txId) }} className='social-icon' />
            <FacebookIcon onClick={() => { createShareWindow('facebook', txId) }} className='social-icon' />
            <LinkedinIcon onClick={() => { createShareWindow('linkedin', txId) }} className='social-icon' />
            <a href={`mailto:?subject=Check out my NFT, now stored on Koi— forever!&body=https://koi.rocks/content-detail/${txId}`} title="Share by Email">
              <EmailIcon className='social-icon' />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
