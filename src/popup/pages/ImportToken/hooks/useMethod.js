import { useSelector } from 'react-redux'
import { TYPE } from 'constants/accountConstants'
import { filter,get, includes } from 'lodash'
import { getDisplayingAccount } from 'popup/selectors/displayingAccount'
import storage from 'services/storage'

const useMethod = ({ contractAddress, userAddresses = [] }) => {
  const displayingAccount = useSelector(getDisplayingAccount)

  const importNewToken = async () => {
    let importedTokens

    switch (displayingAccount.type) {
      case TYPE.SOLANA:
        importedTokens = await storage.setting.get.importedSolanaCustomTokens()
        break
      case TYPE.ETHEREUM:
        importedTokens = await storage.setting.get.importedErc20Tokens()
        break
    }

    if (!get(importedTokens, contractAddress)) importedTokens[contractAddress] = []

    userAddresses.forEach((userAddress) => {
      if (!includes(importedTokens[contractAddress], userAddress))
        importedTokens[contractAddress].push(userAddress)
    })

    switch (displayingAccount.type) {
      case TYPE.SOLANA:
        await storage.setting.set.importedSolanaCustomTokens(importedTokens)
        break
      case TYPE.ETHEREUM:
        await storage.setting.set.importedErc20Tokens(importedTokens)
        break
    }
  }

  const removeToken = async () => {
    let importedTokens
    switch (displayingAccount.type) {
      case TYPE.SOLANA:
        importedTokens = await storage.setting.get.importedSolanaCustomTokens()
        break
      case TYPE.ETHEREUM:
        importedTokens = await storage.setting.get.importedErc20Tokens()
        break
    }

    const addresses = get(importedTokens, contractAddress)
    filter(addresses, (address) => address !== userAddress)
  }

  return { importNewToken, removeToken }
}

export default useMethod
