import React from 'react'
import clsx from 'clsx'

import WelcomeBackgroundTop from 'img/v2/onboarding/welcome-background-top.svg'
import WelcomeBackgroundBottom from 'img/v2/onboarding/welcome-background-bottom.svg'
import CreateNewIcon from 'img/v2/onboarding/create-new-icon.svg'
import KeySelectedIcon from 'img/v2/onboarding/key-selected-icon.svg'

const AddAKey = ({ step, setStep }) => {
  return (
    <div className="w-4/5 flex flex-col text-white">
      <WelcomeBackgroundTop className="absolute top-0 right-0" />
      <WelcomeBackgroundBottom className="absolute bottom-0 left-0" />
      <div className="font-normal text-base leading-6 text-left" style={{ width: '347px' }}>
        Do you already <span className="text-warning">have a key</span> you want to use or do you
        want to <span className="text-success">start from scratch?</span>
      </div>
      <div className="mt-12 flex w-full justify-between">
        <div
          className={clsx(
            'bg-blue-800 shadow-md rounded-finnie z-10',
            'flex flex-col items-center justify-center cursor-pointer',
            'hover:border-turquoiseBlue border-transparent border'
          )}
          style={{ width: '249px', height: '140px' }}
          onClick={() => setStep(step + 1)}
        >
          <CreateNewIcon style={{ width: '32px', height: '32px' }} />
          <div className="mt-3 font-semibold text-base leading-4 text-center text-white">
            Start from scratch.
          </div>
          <div className="mt-2 font-normal text-xs text-center tracking-finnieSpacing-wide text-white">
            Get a new key.
          </div>
        </div>
        <div
          className={clsx(
            'bg-blue-800 shadow-md rounded-finnie z-10',
            'flex flex-col items-center justify-center cursor-pointer',
            'hover:border-turquoiseBlue border-transparent border'
          )}
          style={{ width: '249px', height: '140px' }}
        >
          <KeySelectedIcon style={{ width: '48px', height: '48px' }} />
          <div className="mt-3 font-semibold text-base leading-4 text-center text-white">
            Use my existing key.
          </div>
          <div className="mt-2 font-normal text-xs text-center tracking-finnieSpacing-wide text-white w-9/12">
            Import a key with a recovery phrase.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAKey