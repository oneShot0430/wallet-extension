import React, { createRef, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { NavLink } from 'react-router-dom'

import Balance from 'finnie-v2/components/Balance'
import DefaultAvatar from 'img/v2/default-avatar.svg'
import KoiiLogo from 'img/v2/koii-logos/finnie-koii-logo-white.svg'
import NotificationIcon from 'img/v2/bell-icon.svg'

import AccountSettings from 'finnie-v2/components/AccountSettings'
import ActivityCenterDropdown from 'finnie-v2/components/ActivityCenterDropdown'

import Loading from 'options/components/loading'
import { GalleryContext } from 'options/galleryContext'

const NavBar = () => {
  const { isLoading, profilePictureId } = useContext(GalleryContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = createRef()

  const defaultAccount = useSelector((state) => state.defaultAccount)

  const toggleDropdownMenu = () => setShowDropdown(!showDropdown)
  const closeDropdownMenu = () => setShowDropdown(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdownMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <header className="sticky top-0 z-50 w-full h-16 flex items-center bg-indigo-900 px-5.25 text-white text-sm justify-between">
      <div className="flex items-center">
        <KoiiLogo className="h-8 w-10.75" />
        <nav className="ml-6.25 tracking-finnieSpacing-wider">
          <NavLink to="/v2/gallery">Gallery</NavLink>
        </nav>
      </div>

      <div className="flex items-center">
        {isLoading !== 0 && <Loading />}
        <NotificationIcon className="h-5 w-3.75 mx-6.5" />
        <Balance koiiBalance={defaultAccount.koiBalance} arBalance={defaultAccount.balance} />
        <div className="relative">
          <div
            className="w-10 h-10 cursor-pointer rounded-full ml-6.5"
            onClick={toggleDropdownMenu}
          >
            {profilePictureId ? (
              <img
                className="object-cover rounded-full w-full h-full"
                src={`https://arweave.net/${profilePictureId}`}
              />
            ) : (
              <DefaultAvatar className="object-cover rounded-full w-full h-full" />
            )}
          </div>
          {showDropdown && (
            <AccountSettings
              ref={dropdownRef}
              className="absolute top-14 right-0 rounded shadow-2xl"
            />
          )}
          <ActivityCenterDropdown />
        </div>
      </div>
    </header>
  )
}

export default NavBar
