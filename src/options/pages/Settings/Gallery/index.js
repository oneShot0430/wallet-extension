import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ToggleButton from 'options/components/ToggleButtonOld'
import { GalleryContext } from 'options/galleryContext'
import storage from 'services/storage'

import './index.css'

export default () => {
  const { showViews, setShowViews, showEarnedKoi, setShowEarnedKoi } = useContext(GalleryContext)

  const walletLoaded = useSelector((state) => state.walletLoaded)

  useEffect(() => {
    const saveSettings = async () => {
      await storage.setting.set.showViews(showViews)
      await storage.setting.set.showEarnedKoi(showEarnedKoi)
    }

    if (walletLoaded) saveSettings()
  }, [showViews, showEarnedKoi])

  return (
    <div className='galery-settings-wrapper'>
      <div className='galery-settings'>
        <div className='header'>{chrome.i18n.getMessage('gallerySettings')}</div>
        <div className='settings-row'>
          <div className='left'>
            <div className='title'>{chrome.i18n.getMessage('displayViews')}</div>
            <div className='description'>
              {chrome.i18n.getMessage('showViewSetting')}
            </div>
          </div>
          <div className='right'>
            <ToggleButton value={showViews} setValue={setShowViews} />
          </div>
        </div>

        <div className='settings-row'>
          <div className='left'>
            <div className='title'>{chrome.i18n.getMessage('displayKOIIEarnedSetting')}</div>
            <div className='description'>
              {chrome.i18n.getMessage('showAmountSetting')}
            </div>
          </div>
          <div className='right'>
            <ToggleButton
              value={showEarnedKoi}
              setValue={setShowEarnedKoi}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
