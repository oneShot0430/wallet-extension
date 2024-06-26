import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useDispatch } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { TYPE } from 'constants/accountConstants'
import Avatar from 'img/ab-avatar.png'
import TickIcon from 'img/ab-circle-tick.svg'
import CloseIcon from 'img/ab-close-icon.svg'
import CopyIcon from 'img/copy-icon.svg'
import AddIcon from 'img/navbar/create-nft.svg'
import TrashIcon from 'img/trash-bin.svg'
import isEmpty from 'lodash/isEmpty'
import { setError } from 'options/actions/error'
import { setQuickNotification } from 'options/actions/quickNotification'
import { isArweaveAddress, isEthereumAddress, isSolanaAddress } from 'utils'

import Button from '../Button'

import './index.css'

const EditContactForm = ({ onClose, contact, updateAddress }) => {
  const dispatch = useDispatch()

  const [userInfo, setUserInfo] = useState(contact)

  const [userAddresses, setUserAddresses] = useState(contact.addresses)

  const handleSubmit = async () => {
    if (isEmpty(userInfo.name)) {
      dispatch(setError(chrome.i18n.getMessage('emptyAddressError')))
      return
    }

    let isValid = true

    // TODO need to ask Kayla's confirmation about TYPE of address
    const classifiedAddresses = [...userAddresses]
    classifiedAddresses.forEach((address) => {
      if (isArweaveAddress(address.value)) {
        address.type = TYPE.ARWEAVE
      } else if (isEthereumAddress(address.value)) {
        address.type = TYPE.ETHEREUM
      } else if (isSolanaAddress(address.value)) {
        address.type = TYPE.K2
      } else {
        isValid = false
      }
    })

    if (!isValid) {
      dispatch(setError(chrome.i18n.getMessage('invalidAddressList')))
      return
    }

    setUserAddresses(classifiedAddresses)

    await updateAddress({ ...userInfo, addresses: userAddresses })
    dispatch(setQuickNotification(chrome.i18n.getMessage('addressBookUpdateAddress')))
  }

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  const handleUserAddressNameChange = (idx, e) => {
    const prevUserAddresses = [...userAddresses]
    prevUserAddresses[idx]['name'] = e.target.value

    setUserAddresses(prevUserAddresses)
  }

  const handleUserAddressValueChange = (idx, e) => {
    const prevUserAddresses = [...userAddresses]
    prevUserAddresses[idx]['value'] = e.target.value

    setUserAddresses(prevUserAddresses)
  }

  return (
    <div className="ab-contact-form">
      <div className="ab-contact-form__body">
        <div className="ab-close-icon" onClick={onClose}>
          <CloseIcon />
        </div>

        <img className="ab-contact-form__avatar" src={Avatar} alt="avatar" />

        <input
          className="ab-contact-form__name"
          placeholder={chrome.i18n.getMessage('name')}
          name="name"
          onChange={handleUserInfoChange}
          value={userInfo.name}
        />

        <div className="ab-contact-form__notes-label">Notes</div>
        <input
          className="ab-contact-form__notes"
          placeholder={chrome.i18n.getMessage('addressBookNote')}
          name="notes"
          onChange={handleUserInfoChange}
          value={userInfo.notes}
        />

        {userAddresses.map((address, idx) => (
          <div className="ab-contact-form__input-group" key={idx}>
            <div className="input-group__first-row">
              <input
                className="input-group__label"
                placeholder={`Address #${idx + 1}`}
                onChange={(e) => handleUserAddressNameChange(idx, e)}
                value={address.name}
              />
            </div>
            <div className="input-group__second-row">
              <div className="second-row__left">
                <input
                  className="input-group__input-value"
                  placeholder={chrome.i18n.getMessage('addressBookAddress')}
                  onChange={(e) => handleUserAddressValueChange(idx, e)}
                  value={address.value}
                />
                <div className="ab-copy-icon" data-tip={chrome.i18n.getMessage('copyToClipboard')}>
                  <CopyToClipboard text={address.value}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
              <div
                className="ab-trash-icon"
                data-tip={chrome.i18n.getMessage('removeThisAddress')}
                data-for="remove"
                onClick={() => {
                  const newAddresses = [...userAddresses]
                  newAddresses.splice(idx, 1)
                  setUserAddresses(newAddresses)
                }}
              >
                <TrashIcon />
              </div>
            </div>
          </div>
        ))}

        <div
          className="ab-contact-form__add-more"
          // TODO need to ask Kayla's confirmation about TYPE of address
          onClick={() =>
            setUserAddresses([
              ...userAddresses,
              { name: `Address #${userAddresses.length + 1}`, value: '', type: TYPE.ARWEAVE }
            ])
          }
        >
          <div className="ab-form-add-icon">
            <AddIcon />
          </div>
          <span>{chrome.i18n.getMessage('newAddress')}</span>
        </div>

        <div className="ab-contact-form__input-group ab-contact-form__input-group--did">
          {/* <div className="input-group__first-row">
            <input
              className="input-group__label"
              placeholder={chrome.i18n.getMessage('addressBookDIDLink')}
              name="didName"
              value={userInfo.didName}
              onChange={handleUserInfoChange}
            />
          </div> */}
          {/* <div className="input-group__second-row">
            <div className="second-row__left">
              <input
                className="input-group__input-value"
                placeholder={chrome.i18n.getMessage('addressBookDIDValue')}
                name="didValue"
                value={userInfo.didValue}
                onChange={handleUserInfoChange}
              />
              <div className="ab-copy-icon" data-tip={chrome.i18n.getMessage('copyToClipboard')}>
                <CopyIcon />
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="ab-contact-form__footer">
        <Button startIcon={CloseIcon} onClick={onClose} text={chrome.i18n.getMessage('cancel')} />
        <Button startIcon={TickIcon} onClick={handleSubmit} text={chrome.i18n.getMessage('save')} variant="normal" />
      </div>

      <ReactTooltip place="top" effect="float" />
      <ReactTooltip id="remove" place="left" effect="float" />
    </div>
  )
}

export default EditContactForm
