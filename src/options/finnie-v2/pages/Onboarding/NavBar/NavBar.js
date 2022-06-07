import React from 'react'

import KoiIcon from 'img/v2/onboarding/finnie-koii-logo.svg'
import BackIcon from 'img/v2/back-icon.svg'
import LockIcon from 'img/v2/onboarding/lock-icon.svg'
import KeyIcon from 'img/v2/onboarding/key-icon.svg'
import EditIcon from 'img/v2/onboarding/edit-icon.svg'
import SeedphraseIcon from 'img/v2/onboarding/seedphrase-icon.svg'
import LockSelectedIcon from 'img/v2/onboarding/lock-selected-icon.svg'
import KeySelectedIcon from 'img/v2/onboarding/key-selected-icon.svg'
import EditSelectedIcon from 'img/v2/onboarding/edit-selected-icon.svg'
import SeedphraseSelectedIcon from 'img/v2/onboarding/seedphrase-selected-icon.svg'

import { onboardingSteps } from '../Welcome'

const NavBar = ({ step, setStep }) => {
  return (
    <div className="w-1/3 h-full bg-blue-800 shadow-lg flex flex-col items-center overflow-hidden">
      {step > 1 && (
        <BackIcon
          className="absolute top-5.5 left-6 cursor-pointer"
          style={{ width: '45px', height: '45px' }}
          onClick={() => setStep(step - 1)}
        />
      )}
      <div className="flex flex-col items-center">
        <KoiIcon style={{ width: '156px', height: '156px' }} />
        {onboardingSteps[step] === 'CREATE_PASSWORD' && (
          <div
            className="font-normal tracking-finnieSpacing-tightest text-white -pt-4"
            style={{ fontSize: '40px', lineHeight: '48px' }}
          >
            Welcome to the Finnie Wallet
            <div className="mt-6.25 mb-8 font-normal text-lg tracking-finnieSpacing-tight  text-success">
              Get set up in just 4 quick & easy steps.
            </div>
          </div>
        )}
      </div>
      <div className="w-full pl-6 flex flex-col items-start gap-6 pt-8 font-normal text-base leading-8 text-white select-none text-left">
        {step === 0 ? (
          <div className="flex items-center text-warning">
            <LockSelectedIcon className="mr-5" />
            Secure Finnie with a password.
          </div>
        ) : (
          <div className="flex items-center">
            <LockIcon className="mr-5" />
            Secure Finnie with a password.
          </div>
        )}
        {step === 1 || step === 2 ? (
          <div className="flex items-center text-warning">
            <KeySelectedIcon className="mr-5" />
            Create or import a key.
          </div>
        ) : (
          <div className="flex items-center">
            <KeyIcon className="mr-5" />
            Create or import a key.
          </div>
        )}
        {2 < step && step < 6 ? (
          <div className="flex items-center text-warning">
            <EditSelectedIcon className="mr-5" />
            Write down your recovery phrase.
          </div>
        ) : (
          <div className="flex items-center">
            <EditIcon className="mr-5" />
            Write down your recovery phrase.
          </div>
        )}
        {step === 6 ? (
          <div className="flex items-center text-warning">
            <SeedphraseSelectedIcon className="mr-5" />
            Confirm your recovery phrase.
          </div>
        ) : (
          <div className="flex items-center">
            <SeedphraseIcon className="mr-5" />
            Confirm your recovery phrase.
          </div>
        )}
      </div>
    </div>
  )
}

export default NavBar