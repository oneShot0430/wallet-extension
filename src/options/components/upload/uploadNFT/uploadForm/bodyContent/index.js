import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import trim from 'lodash/trim'
import union from 'lodash/union'
import get from 'lodash/get'

import Checkbox from 'popup/components/shared/checkbox'
import './index.css'
import EditIcon from 'img/edit-icon-collection.svg'
import { TYPE } from 'constants/accountConstants'
import { getArAccounts } from 'options/selectors/accounts'

import { loadNFTCost } from 'utils'

import { formatNumber } from 'options/utils'
import { GalleryContext } from 'options/galleryContext'
import { UploadContext } from '../../../index'

const Empty = ({ setClicked }) => {
  useEffect(() => {
    setClicked(false)
  })

  return (<></>)
}

export default ({
  stage,
  title,
  description,
  username,
  setDescription,
  setTitle,
  setUsername,
  isNSFW,
  setIsNSFW,
  tagInput,
  setTagInput,
  setClicked
}) => {
  const { setTags, tags, isFriendCodeValid, price, setPrice } = useContext(UploadContext)
  const { file, account, setAccount, setShowSelectAccount } = useContext(GalleryContext)

  const arAccounts = useSelector(getArAccounts)

  const addTag = (e) => {
    const { keyCode } = e
    if (keyCode === 13 || keyCode === 188) {
      let newTags = tagInput.split(',')
      newTags = newTags.map((tag) => trim(tag)).filter((tag) => tag.replace(/\s/g, '').length)
      setTags(union(tags, newTags))
      setTagInput('')
    }
  }

  useEffect(() => {
    const getPrice = async () => {
      if (file) {
        const arPrice = await loadNFTCost(file.size)
        setPrice(arPrice)        
      }
    }

    getPrice()
  }, [file])

  useEffect(() => {
    if(account.type !== TYPE.ARWEAVE){
      setAccount(arAccounts[0])
    }
  }, [])

  if (stage == 1) {
    return (
      <div className='right-column stage1'>
        <Empty setClicked={setClicked} />
        <div className='field'>
          <div className='field-label change-account'>
            <div onClick={() => setShowSelectAccount(true)} className='edit-icon'><EditIcon /></div>
            Wallet
          </div>
          <div className='field-input select-account'>
            {get(account, 'accountName')}
            <div className='address'>{account.address && `${get(account, 'address', '').slice(0,5)}...${get(account, 'address', '').slice(account.address.length - 4)}`}</div>
          </div>
        </div>
        <div className='field'>
          <label className='field-label'>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='field-input'
          ></input>
        </div>
        <div className='field'>
          <label className='field-label'>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='field-input'
          ></input>
        </div>
        <div className='field'>
          <div hidden={true} className='field-checkbox'>
            <Checkbox />
          </div>
          <label hidden={true} className='field-label-checkbox'>
            Save my username for future NFTs
          </label>
        </div>
        <div className='field'>
          <label className='field-label'>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='field-input'
          />
        </div>
        <div className='field'>
          <label className='field-label'>Tags</label>
          <input
            className='field-input'
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyUp={addTag}
          ></input>
        </div>
        <div className='field'>
          <label className='field-label'>NSFW</label>
          <div className='select-option'>
            <input
              className='checkbox-input'
              type='checkbox'
              checked={isNSFW}
              onChange={(e) => setIsNSFW(e.target.checked)}
              id='nsfw'
            />
            <div><label htmlFor='nsfw'>This content is ‘Not Safe for Work,’ explicit, or 18+.</label></div>
          </div>
        </div>
      </div>
    )
  }

  if (stage == 2) {
    return (
      <div className='right-column stage2'>
        <div className='estimate-cost'>
          <div className='estimate-cost-title'>Estimated Costs</div>
          <div className='estimate-ar'>{formatNumber(price, 6)} AR</div>
          <div className='estimate-koi'>
            <span
              className={`koi-consumed ${
                isFriendCodeValid ? 'ignore-consumed' : ''
              }`}
            >
              1.00 KOI
            </span>
            {isFriendCodeValid && <span className='koi-free'>Free!</span>}
          </div>
        </div>
      </div>
    )
  }

  // Congratulation screen
  return <div></div>
}
