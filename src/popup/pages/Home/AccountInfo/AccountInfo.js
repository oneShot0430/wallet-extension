import clsx from 'clsx'
import includes from 'lodash/includes'
import React from 'react'
import { Switch, Route, NavLink, Redirect } from 'react-router-dom'
import { useHistory, useLocation } from 'react-router-dom'
import { useParallax } from 'react-scroll-parallax'

import BackBtn from 'img/v2/popup-back-btn.svg'
import { TYPE } from 'constants/accountConstants'

import Tokens from './Tokens'
import Assets from './Assets'
import Activity from './Activity'

import { fiatCurrencyFormat, numberFormat } from 'utils'

const tabs = [
  { name: 'Assets', to: '/assets' },
  { name: 'Tokens', to: '/tokens' },
  { name: 'Activity', to: '/activity' }
]

const AccountInfo = ({ defaultAccount, price }) => {
  const history = useHistory()

  const assetHeaderParallax = useParallax({
    translateX: [-100, 0],
    shouldAlwaysCompleteAnimation: true,
    startScroll: 0,
    endScroll: 161
  })

  const location = useLocation()

  return (
    <div>
      <div
        ref={assetHeaderParallax.ref}
        className={clsx(
          'z-20 w-full bg-white fixed top-13.5',
          includes(location.pathname, 'assets') ? 'h-15.25' : 'h-24'
        )}
      >
        <BackBtn
          onClick={() => history.goBack()}
          className="w-8.75 h-8.75 z-20 absolute top-3.25 left-3.75 cursor-pointer"
        />
        {!includes(location.pathname, 'assets') ? (
          <div className="h-full px-17.25 py-3">
            {defaultAccount.type !== TYPE.ETHEREUM && (
              <div className="text-blue-800 text-4xl tracking-finnieSpacing-tightest">
                {numberFormat(defaultAccount.koiBalance)} KOII
              </div>
            )}
            {defaultAccount.type === TYPE.ETHEREUM && (
              <div className="flex flex-col">
                <div className="text-blue-800 text-4xl tracking-finnieSpacing-tightest">
                  {numberFormat(defaultAccount.balance)} ETH
                </div>
                <div
                  className="text-base leading-8 tracking-finnieSpacing-tight"
                  style={{ color: '#707070' }}
                >
                  ${fiatCurrencyFormat(defaultAccount.balance * price.ETH)} USD
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <div
        className={clsx(
          'sticky shadow-lg h-10.75 z-40 flex items-stretch bg-trueGray-100 text-blue-600 text-base',
          includes(location.pathname, 'assets') ? 'top-15.25' : 'top-24'
        )}
      >
        {tabs.map((tab, idx) => (
          <NavLink
            key={idx}
            to={tab.to}
            className={clsx('w-1/3 h-10.75 flex items-center justify-center cursor-pointer')}
            activeClassName="font-semibold bg-lightBlue"
          >
            {tab.name}
          </NavLink>
        ))}
      </div>
      <Switch>
        <Route exact path="/assets">
          <Assets />
        </Route>
        <Route exact path="/activity">
          <Activity />
        </Route>
        <Route exact path="/tokens">
          <Tokens />
        </Route>
        <Redirect to="/tokens" />
      </Switch>
    </div>
  )
}

export default AccountInfo