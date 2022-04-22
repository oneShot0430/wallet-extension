import { TYPE } from 'constants/accountConstants'
import { useEffect, useState } from 'react'

const validateEthereumAddress = (address) => {
  return address.includes('0x') && address.length === 42
}

const validateArweaveAddress = (address) => {
  return !address.includes('0x') && address.length === 43
}

const NOT_ENOUGH_BALANCE = `Not enough token amount`
const INVALID_RECIPIENT = 'Invalid recipient address'

const useValidate = ({ selectedToken, amount, recipient, selectedAccount, alchemyAddress }) => {
  const [validated, setValidated] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Please fill in all fields')

  useEffect(() => {
    const throwValidationError = (message) => {
      setValidated(false)
      setErrorMessage(message)
    }
 
    const validate = () => {
      let balance = selectedToken?.balance
      let rate = 10 ** selectedToken?.decimal
      if (selectedToken?.decimal === 1) rate = 1
      
      // validate balance
      if (balance < (amount * rate)) return throwValidationError(NOT_ENOUGH_BALANCE)

      // validate recipient address
      if (selectedAccount?.type === TYPE.ARWEAVE) {
        if (!validateArweaveAddress(recipient)) return throwValidationError(INVALID_RECIPIENT)
      }

      if (selectedAccount?.type === TYPE.ETHEREUM) {
        if (alchemyAddress) {
          if (!validateEthereumAddress(alchemyAddress)) return throwValidationError(INVALID_RECIPIENT)
        } else {
          if (!validateEthereumAddress(recipient)) return throwValidationError(INVALID_RECIPIENT)
        }
      }

      setValidated(true)
    }

    if (selectedToken && amount && recipient && selectedAccount) validate()
  }, [selectedToken, amount, recipient, selectedAccount, alchemyAddress])

  return { validated, errorMessage }
}

export default useValidate