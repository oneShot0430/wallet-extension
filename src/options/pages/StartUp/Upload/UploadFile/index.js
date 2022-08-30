import React, { useEffect } from 'react'
import { TYPE } from 'constants/accountConstants'
import isEmpty from 'lodash/isEmpty'
import GoBackBtn from 'options/finnie-v1/components/GoBackButton'

import Dropfile from '../../shared/Dropfile'
import useEthereumNetworks from '../../shared/useEthereumNetworks'

export default ({ file, setFile, nextStep, walletType, setSelectedNetwork, previousStep}) => {
  const { selectedNetwork, EthereumNetworks } = useEthereumNetworks({})

  useEffect(() => {
    if (walletType === TYPE.ETHEREUM) setSelectedNetwork(selectedNetwork)
  }, [selectedNetwork])

  return (
    <div className='upload-file-form'>
      <div className='title'>Import a key with a .JSON file</div>
      {walletType === TYPE.ETHEREUM && (<EthereumNetworks />)}
      
      {walletType && <div className='upload-file'>
        <div className='description'>
        Drag & drop an existing .JSON key file here or click to browse your
        computer.
        </div>
        <Dropfile className='upload-key' file={file} setFile={setFile} />
        <button
          disabled={isEmpty(file)}
          onClick={nextStep}
          className='upload-file-button white-button'
        >
        Upload File
        </button>
      </div>}
      <GoBackBtn goToPreviousStep={previousStep} />
    </div>
  )
}
