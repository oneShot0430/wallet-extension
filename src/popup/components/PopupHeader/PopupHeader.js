import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import AccountDropdown from './AccountDropdown'
import Account from './Account'

import storage from 'services/storage'

import Avatar from 'img/popup/avatar-icon.svg'
import OptionIcon from 'img/popup/option-icon.svg'
import SettingIcon from 'img/popup/setting-icon.svg'
import PauseIcon from 'img/popup/pause-icon.svg'
import PlayIcon from 'img/popup/play-icon.svg'

import disableOrigin from 'utils/disableOrigin'

const Header = ({ setShowConnectedSites }) => {
  const defaultArweaveAccount = useSelector((state) => state.defaultAccount.AR)

  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showPauseFinnieDropdown, setShowPauseFinnieDropdown] = useState(false)
  const [currentTabOrigin, setCurrentTabOrigin] = useState('')
  const [originDisabled, setOriginDisabled] = useState(false)

  const loadDisabledOrigins = () => {
    chrome.windows.getCurrent((w) => {
      try {
        const windowId = w.id
        chrome.tabs.getSelected(windowId, (tab) => {
          const origin = tab.url.split('/')[0] + '//' + tab.url.split('/')[2]
          setCurrentTabOrigin(origin)
          storage.setting.get.disabledOrigins().then((disabledOrigins) => {
            setOriginDisabled(disabledOrigins.includes(origin))
          })
        })
      } catch (err) {}
    })
  }

  const goToSetting = () => {
    const url = chrome.extension.getURL('options.html#/settings/KID')
    chrome.tabs.create({ url })
  }

  const goToDID = () => {
    const DID = defaultArweaveAccount?.didData?.state?.kID
    const url = 'https://koii.id/' + (DID || '')
    chrome.tabs.create({ url })
  }

  const goToReportAnIssue = () => {
    const url = 'https://share.hsforms.com/1Nmy8p6zWSN2J2skJn5EcOQc20dg'
    chrome.tabs.create({ url })
  }

  const handleDisableFinnie = async () => {
    if (!originDisabled) {
      await disableOrigin.addDisabledOrigin(currentTabOrigin)
      setOriginDisabled(true)
    } else {
      await disableOrigin.removeDisabledOrigin(currentTabOrigin)
      setOriginDisabled(false)
    }
  }

  const ref = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    loadDisabledOrigins()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && modalRef.current.contains(event.target)) {
        return
      } else if (ref.current && !ref.current.contains(event.target)) {
        setShowPauseFinnieDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, modalRef])

  return (
    <div
      className="fixed flex shadow-md z-50"
      style={{ height: '54px', backgroundColor: '#8585BC' }}
      ref={ref}
    >
      <div className="relative">
        <Account
          showAccountDropdown={showAccountDropdown}
          setShowAccountDropdown={setShowAccountDropdown}
        />
        {showAccountDropdown && <AccountDropdown setShowAccountDropdown={setShowAccountDropdown} />}
      </div>
      <div
        onClick={goToSetting}
        className="bg-white flex items-center justify-center cursor-pointer"
        style={{ width: '59px' }}
      >
        <SettingIcon style={{ width: '33px', height: '32px' }} />
      </div>
      <div
        className="bg-blue-800 flex items-center justify-center mr-0.25 cursor-pointer"
        style={{ width: '87px' }}
        onClick={goToDID}
      >
        <Avatar className="mt-1.25" />
      </div>
      <div
        onClick={() => setShowPauseFinnieDropdown((prev) => !prev)}
        className="bg-blue-800 flex items-center justify-center cursor-pointer"
        style={{ width: '30px' }}
      >
        <OptionIcon />
      </div>
      <div className="z-50">
        {showPauseFinnieDropdown && (
          <div
            style={{ width: '252px', height: '92px', right: '0px', top: '54px' }}
            className="text-base text-white absolute"
            ref={modalRef}
          >
            <div
              style={{ height: '46px', paddingRight: '16px', zIndex: 100 }}
              className="bg-blue-800 hover:bg-blue-400 cursor-pointer flex items-center justify-end"
              onClick={() => {
                setShowConnectedSites(true)
                setShowPauseFinnieDropdown(false)
              }}
            >
              See connected sites
            </div>
            <div
              onClick={handleDisableFinnie}
              style={{ height: '46px', paddingRight: '16px', borderBottom: '1px solid #8585BC' }}
              className="bg-blue-800 hover:bg-blue-400 cursor-pointer flex items-center justify-end"
            >
              <div className="flex items-center justify-center" style={{ marginRight: '6px' }}>
                {!originDisabled ? <PauseIcon /> : <PlayIcon />}
              </div>
              {!originDisabled ? 'Pause Finnie on this site' : 'Resume Finnie'}
            </div>
            <div
              onClick={goToReportAnIssue}
              style={{ height: '46px', paddingRight: '16px', zIndex: 100 }}
              className="bg-blue-800 hover:bg-blue-400 cursor-pointer flex items-center justify-end"
            >
              Report an Issue
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
