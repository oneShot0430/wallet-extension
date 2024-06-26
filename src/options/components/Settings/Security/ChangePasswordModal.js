import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import BackIcon from 'img/v2/back-icon-blue.svg'
import CheckIcon from 'img/v2/check-icon-gray.svg'
import CloseIcon from 'img/v2/close-icon-blue.svg'
import NoticeIcon from 'img/v2/notice-icon.svg'
import isEmpty from 'lodash/isEmpty'
import { setIsLoading, setLoaded } from 'options/actions/loading'
import Button from 'options/components/Button'
import { popupBackgroundRequest as backgroundRequest } from 'services/request/popup'

import './ChangePasswordModal.css'

const ChangePasswordModal = ({ close }) => {
  const dispatch = useDispatch()

  const [step, setStep] = useState(1)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [oldPasswordError, setOldPasswordError] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [disableUpdatePassword, setDisableUpdatePassword] = useState(false)
  const modalRef = useRef(null)

  const passwordRegex = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        close()
      }
    }

    const handlePressingEsc = (event) => {
      if (event.defaultPrevented) {
        return // Should do nothing if the default action has been cancelled
      }

      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handlePressingEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handlePressingEsc)
    }
  }, [modalRef])

  const validatePasswords = () => {
    let validPassword = true
    if (isEmpty(oldPassword)) {
      setOldPasswordError(chrome.i18n.getMessage('passwordIsIncorrect'))
      validPassword = false
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(chrome.i18n.getMessage('passwordDoNotMatch'))
      validPassword = false
    } else {
      setConfirmPasswordError('')
    }

    if (isEmpty(newPassword) || !passwordRegex.test(newPassword)) {
      validPassword = false
      setNewPasswordError(chrome.i18n.getMessage('passwordErrorMsg'))
    } else {
      setNewPasswordError('')
    }

    return validPassword
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return
    try {
      dispatch(setIsLoading)
      setDisableUpdatePassword(true)
      await backgroundRequest.wallet.updatePassword({
        oldPassword,
        newPassword
      })
      setOldPasswordError('')
      dispatch(setLoaded)
      setDisableUpdatePassword(false)
      setStep(2)
    } catch (err) {
      dispatch(setLoaded)
      setDisableUpdatePassword(false)
      console.log(err.message)

      if (err.message === 'Incorrect password') {
        setOldPasswordError(chrome.i18n.getMessage('passwordIsIncorrect'))
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleUpdatePassword()
    }
  }
  return (
    <div className="fixed z-51 top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-25">
      <div
        style={
          step === 1
            ? { width: '510px', height: '428px' }
            : { width: '510px', height: '277px', position: 'relative' }
        }
        className="rounded bg-trueGray-100 flex flex-col items-center text-indigo"
        ref={modalRef}
      >
        <div className="flex h-16.75 rounded-t bg-trueGray-100 shadow-md w-full font-semibold text-xl tracking-finnieSpacing-wide relative">
          {step === 1 && (
            <BackIcon onClick={close} className="w-7 h-7 top-4 left-4 absolute cursor-pointer" />
          )}
          {step === 1 ? (
            <div className="m-auto">{chrome.i18n.getMessage('changeMyPassword')}</div>
          ) : (
            <div className="m-auto">{chrome.i18n.getMessage('passwordConfirmed')}</div>
          )}
          <CloseIcon onClick={close} className="w-7 h-7 top-4 right-4 absolute cursor-pointer" />
        </div>

        {step === 1 && (
          <div
            style={{ height: '305px' }}
            className="flex flex-col justify-evenly mt-6.5 change-my-password"
          >
            <div
              style={{ width: '382px' }}
              className="text-sm font-semibold tracking-finnieSpacing-tight text-left"
            >
              {chrome.i18n.getMessage('enterCurrentPassword')}
            </div>
            <input
              type="password"
              style={{ width: '382px', height: '28px' }}
              className="rounded-sm px-1 mt-1.5 bg-trueGray-400 bg-opacity-50 border-b border-indigo border-opacity-80"
              onChange={(e) => setOldPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              name="current-password"
            ></input>
            {!isEmpty(oldPasswordError) && (
              <div
                style={{ width: '382px', height: '24px' }}
                className="pl-1.75 flex items-center mt-2 bg-warning rounded"
              >
                <NoticeIcon className="w-4.25" />
                <span className="ml-1.75">{oldPasswordError}</span>
              </div>
            )}

            <div
              style={{ width: '382px' }}
              className="mt-2 text-sm font-semibold tracking-finnieSpacing-tight text-left"
            >
              {chrome.i18n.getMessage('createNewPassword')}
            </div>
            <input
              type="password"
              style={{ width: '382px', height: '28px' }}
              className="rounded-sm px-1 mt-1.5 bg-trueGray-400 bg-opacity-50 border-b border-indigo border-opacity-80"
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              name="change-new-password"
            ></input>
            {!isEmpty(newPasswordError) && (
              <div
                style={{ width: '382px' }}
                className="pl-1.75 flex items-center mt-2 bg-warning rounded"
              >
                <NoticeIcon className="w-4.25" />
                <span className="ml-1.75">{newPasswordError}</span>
              </div>
            )}

            <div
              style={{ width: '382px' }}
              className="mt-2 text-sm font-semibold tracking-finnieSpacing-tight text-left"
            >
              {chrome.i18n.getMessage('confirmNewPassword')}
            </div>
            <input
              type="password"
              style={{ width: '382px', height: '28px' }}
              className="rounded-sm px-1 mt-1.5 bg-trueGray-400 bg-opacity-50 border-b border-indigo border-opacity-80"
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              name="change-confirm-password"
            ></input>
            {!isEmpty(confirmPasswordError) && (
              <div
                style={{ width: '382px' }}
                className="pl-1.75 flex items-center mt-2 bg-warning rounded"
              >
                <NoticeIcon className="w-4.25" />
                <span className="ml-1.75">{confirmPasswordError}</span>
              </div>
            )}

            <Button
              className="h-10 mt-5 text-base rounded w-43.75 mx-auto"
              variant="indigo"
              text={chrome.i18n.getMessage('saveChanges')}
              onClick={() => handleUpdatePassword()}
              disabled={disableUpdatePassword}
            />
          </div>
        )}
        {step === 2 && (
          <CheckIcon
            style={{ width: '119px', height: '119px' }}
            className="absolute top-21.75 left-4 bg-opacity-50"
          />
        )}

        {step === 2 && (
          <div style={{ height: '93px' }} className="relative mt-20 flex flex-col justify-between">
            <div className="text-base leading-6 font-normal tracking-finnieSpacing-wide">
              {chrome.i18n.getMessage('rememberPasswordSecure')}
            </div>

            <Button
              className="h-10 mt-5 text-base rounded w-43.75 mx-auto"
              variant="indigo"
              text={chrome.i18n.getMessage('gotIt')}
              onClick={() => close()}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChangePasswordModal
