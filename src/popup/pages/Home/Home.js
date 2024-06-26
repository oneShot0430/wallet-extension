import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ParallaxProvider } from 'react-scroll-parallax'
import { TYPE } from 'constants/accountConstants'
import FinnieIcon from 'img/popup/finnie-icon-blue.svg'
import PopupArrow from 'img/popup/popup-arrow-icon.svg'
import PopupBackground from 'img/popup/popup-background.svg'
import isEmpty from 'lodash/isEmpty'
import { getDisplayingAccount } from 'popup/selectors/displayingAccount'

import AccountInfo from './AccountInfo/AccountInfo'
import HomeTop from './HomeTop'
import OverwriteMetamask from './OverwriteMetamask'

const Home = () => {
  const [currentProviderAddress, setCurrentProviderAddress] = useState()
  const [currentSolanaProviderAddress, setCurrentSolanaProviderAddress] = useState()
  const displayingAccount = useSelector(getDisplayingAccount)

  const price = useSelector((state) => state.price)
  const currency = useSelector((state) => state.currency)

  const ref = React.useRef()
  const [scrollEl, setScrollElement] = React.useState(null)

  useEffect(() => {
    setScrollElement(ref.current)
  }, [])

  return (
    <div
      className="flex flex-col w-full overflow-x-hidden"
      style={{ overflowY: 'overlay' }}
      ref={ref}
    >
      {isEmpty(displayingAccount?.address) ? (
        <div>
          <PopupArrow className="absolute" style={{ top: '67px', left: '30px' }} />
          <PopupBackground
            style={{ width: '177px', height: '156px' }}
            className="absolute top-13.5 right-0 z-10 opacity-60"
          />
          <div
            style={{ width: '300px' }}
            className="font-normal text-2xl tracking-finnieSpacing-tight ml-5 mt-40 text-blue-800"
          >
            {chrome.i18n.getMessage('selectAccountToSeeSummary')}
          </div>
          <FinnieIcon className="ml-5 mt-8" style={{ width: '54px', height: '40px' }} />
        </div>
      ) : (
        <ParallaxProvider scrollContainer={scrollEl}>
          <div className="pt-4.75 pl-4.75 mb-3.5">
            <HomeTop
              displayingAccount={displayingAccount}
              price={price}
              currency={currency}
              currentProviderAddress={currentProviderAddress}
              setCurrentProviderAddress={setCurrentProviderAddress}
            />
          </div>
          <AccountInfo
            displayingAccount={displayingAccount}
            currency={currency}
            price={price}
            currentProviderAddress={currentProviderAddress}
          />
          <OverwriteMetamask />
        </ParallaxProvider>
      )}
    </div>
  )
}

export default Home
