import { TYPE } from '../../src/constants/accountConstants'
import { bootstrap } from '../bootstrap'
import Automation, { goToWalletSettingPage } from '../utils/automation'
import { CUSTOM_TOKEN_ADDRESS, SECRET_PHRASES, WALLET_ADDRESS } from '../utils/testConstants'

/* TEST CASES */
describe('AccountManagement', () => {
  let optionPage, extPage, browser, context

  beforeAll(async () => {
    /* Launch option page */
    context = await bootstrap()
    optionPage = context.optionPage
    browser = context.browser

    /* Import wallets */
    await Automation.importWallet(optionPage, TYPE.ETHEREUM)
    await Automation.importWallet(optionPage, TYPE.K2, SECRET_PHRASES.K2, false)
    await Automation.importWallet(optionPage, TYPE.SOLANA, SECRET_PHRASES.TYPE_SOLANA, false)
  }, 500000)

  describe('Display account information', () => {
    let accountCardETH, accountCardK2, accountCardSOL

    beforeAll(async () => {
      /* Move to wallet setting page */
      await goToWalletSettingPage(optionPage)

      /* Assign account cards*/
      accountCardETH = await optionPage.waitForXPath(
        `//div[contains(text(), "${WALLET_ADDRESS.ETHEREUM_SENDER}")]/ancestor::div[@data-testid="account-card-setting-page"]`
      )

      accountCardK2 = await optionPage.waitForXPath(
        `//div[contains(text(), "${WALLET_ADDRESS.K2_ADDRESS}")]/ancestor::div[@data-testid="account-card-setting-page"]`
      )

      accountCardSOL = await optionPage.waitForXPath(
        `//div[contains(text(), "${WALLET_ADDRESS.SOLANA_SENDER}")]/ancestor::div[@data-testid="account-card-setting-page"]`
      )

      /* */
    }, 500000)

    it('should display correct network', async () => {
      await Automation.swapToNetworkOption(
        optionPage,
        WALLET_ADDRESS.ETHEREUM_SENDER,
        'Goerli TestNet',
        accountCardETH
      )

      await Automation.swapToNetworkOption(
        optionPage,
        WALLET_ADDRESS.SOLANA_SENDER,
        'Devnet',
        accountCardSOL
      )

      extPage = await context.launchExtPage()
      await extPage.bringToFront()

      let displayAccount = await extPage.waitForSelector(
        `[data-testid="popup-header-displayingaccount"]`
      )

      await displayAccount.click()

      /* ETH NETWORK */
      const ethAccount = await extPage.waitForXPath(
        `//span[contains(text(), "0x660839")]/ancestor::div[@data-testid="popup-header-account"]`
      )
      await ethAccount.click()

      let providerDropdown = await extPage.waitForSelector(`[data-testid="provider-dropdown"]`)
      let currentNetwork = await providerDropdown.$(`[data-testid="current-label"]`)

      expect(await currentNetwork.evaluate((el) => el.textContent)).toBe('Goerli TestNet')

      await extPage.close()

      /* SOL NETWORK */
      extPage = await context.launchExtPage()
      await extPage.bringToFront()

      displayAccount = await extPage.waitForSelector(
        `[data-testid="popup-header-displayingaccount"]`
      )
      await displayAccount.click()

      const solAccount = await extPage.waitForXPath(
        `//span[contains(text(), "9cGCJ")]/ancestor::div[@data-testid="popup-header-account"]`
      )
      await solAccount.click()

      providerDropdown = await extPage.waitForSelector(`[data-testid="provider-dropdown"]`)
      currentNetwork = await providerDropdown.$(`[data-testid="current-label"]`)

      expect(await currentNetwork.evaluate((el) => el.textContent)).toBe('DEVNET')
      await extPage.close()

      /* K2 NETWORK */
      extPage = await context.launchExtPage()
      await extPage.bringToFront()

      displayAccount = await extPage.waitForSelector(
        `[data-testid="popup-header-displayingaccount"]`
      )
      await displayAccount.click()

      const k2Account = await extPage.waitForXPath(
        `//span[contains(text(), "32Dz2")]/ancestor::div[@data-testid="popup-header-account"]`
      )
      await k2Account.click()

      providerDropdown = await extPage.waitForSelector(`[data-testid="provider-dropdown"]`)
      currentNetwork = await providerDropdown.$(`[data-testid="current-label"]`)

      expect(await currentNetwork.evaluate((el) => el.textContent)).toBe('TESTNET')
      await extPage.close()
    }, 100000)

    it('should display correct account information ETH', async () => {
      extPage = await context.launchExtPage()
      await extPage.bringToFront()
      const displayAccount = await extPage.waitForSelector(
        `[data-testid="popup-header-displayingaccount"]`
      )

      await displayAccount.click()

      const ethAccount = await extPage.waitForXPath(
        `//span[contains(text(), "0x660839")]/ancestor::div[@data-testid="popup-header-account"]`
      )
      await ethAccount.click()

      /* IMPORT CUSTOM TOKEN */
      const goToImportToken = await extPage.waitForSelector(`[data-testid="Tokens"]`)
      await goToImportToken.click()

      const importTokenButton = await extPage.$(`[data-testid="import-token-button"]`)
      await importTokenButton.click()

      const searchInputField = await extPage.waitForSelector(`input`)
      await searchInputField.type(CUSTOM_TOKEN_ADDRESS.ETH_UNI_TOKEN)

      const UNITokenOption = await extPage.waitForSelector(`[data-testid="UNI"]`)
      await UNITokenOption.click()

      const selectAccountCheckbox = await extPage.waitForSelector('div[role="checkbox"]')
      await selectAccountCheckbox.click()

      const [confirmButton] = await extPage.$x('//button[text()="Confirm"]')
      await confirmButton.click()

      await extPage.waitForSelector('[data-testid="popup-loading-screen"]', {
        visible: true
      })

      await extPage.waitForSelector('[data-testid="popup-loading-screen"]', {
        hidden: true
      })

      await extPage.close()
      await optionPage.reload({ waitUntil: 'networkidle0' })

      /* ASSIGN ACCOUNT CARD VALUE */
      accountCardETH = await optionPage.waitForXPath(
        `//div[contains(text(), "${WALLET_ADDRESS.ETHEREUM_SENDER}")]/ancestor::div[@data-testid="account-card-setting-page"]`
      )

      /* CHECK ETH BALANCE */
      const balance = await accountCardETH.$(`[data-testid="account-card-balance"]`)
      const balanceText = await balance.evaluate((el) => el.textContent)
      const mainBalance = balanceText.split(' ')[1]
      const mainSymbol = balanceText.split(' ')[2]

      expect(Number(mainBalance)).toBeGreaterThan(0)
      expect(mainSymbol).toBe('ETH')

      const extendButton = await accountCardETH.$(
        `[data-testid="account-card-drop-down-${WALLET_ADDRESS.ETHEREUM_SENDER}"]`
      )
      await extendButton.click()

      const accountBalances = await accountCardETH.$(`[data-testid="account-card-account-balance"]`)
      const accountBalanceMain = await accountBalances.$(
        `[data-testid="account-card-account-balance-ETH"]`
      )
      let tokenBalance, tokenSymbol
      tokenBalance = (await accountBalanceMain.evaluate((el) => el.textContent)).split(' ')[0]
      tokenSymbol = (await accountBalanceMain.evaluate((el) => el.textContent)).split(' ')[1]
      expect(Number(tokenBalance)).toBeGreaterThan(0)
      expect(Number(tokenBalance)).toEqual(Number(mainBalance))
      expect(tokenSymbol).toBe('ETH')

      /* CHECK UNI BALANCE */
      const accountBalanceCustom = await accountBalances.$(
        `[data-testid="account-card-account-balance-UNI"]`
      )
      tokenBalance = (await accountBalanceCustom.evaluate((el) => el.textContent)).split(' ')[0]
      tokenSymbol = (await accountBalanceCustom.evaluate((el) => el.textContent)).split(' ')[1]
      expect(Number(tokenBalance)).toBeGreaterThan(0)
      expect(tokenSymbol).toBe('UNI')

      /* CHECK ETH ASSETS */
      const assets = await accountCardETH.$(`[data-testid="account-card-assets"]`)
      const assetsText = await assets.evaluate((el) => el.textContent)
      const assetsValue = assetsText.split(' ')[1]
      expect(Number(assetsValue)).toBeGreaterThanOrEqual(0)

      const nftAssets = await accountCardETH.$(`[data-testid="account-card-nft-assets"]`)
      const nftAssetsText = await nftAssets.evaluate((el) => el.textContent)
      const [nftAssetsValue, nftAssetsSymbol] = nftAssetsText.split(' ')
      expect(Number(nftAssetsValue)).toBeGreaterThanOrEqual(0)
      expect(Number(nftAssetsValue)).toEqual(Number(assetsValue))
      expect(nftAssetsSymbol).toBe('ETH')
    }, 100000)

    it('should display correct account information SOL', async () => {
      extPage = await context.launchExtPage()
      await extPage.bringToFront()
      const displayAccount = await extPage.waitForSelector(
        `[data-testid="popup-header-displayingaccount"]`
      )

      await displayAccount.click()

      const solAccount = await extPage.waitForXPath(
        `//span[contains(text(), "9cGCJ")]/ancestor::div[@data-testid="popup-header-account"]`
      )
      await solAccount.click()

      /* IMPORT CUSTOM TOKEN */
      const goToImportToken = await extPage.waitForSelector(`[data-testid="Tokens"]`)
      await goToImportToken.click()

      const importTokenButton = await extPage.$(`[data-testid="import-token-button"]`)
      await importTokenButton.click()

      const searchInputField = await extPage.waitForSelector(`input`)
      await extPage.waitForTimeout(3000)

      await searchInputField.type(CUSTOM_TOKEN_ADDRESS.SOL_USDC_TOKEN)

      const USDCTokenOption = await extPage.waitForSelector(`[data-testid="USDC"]`)
      await USDCTokenOption.click()

      let selectAccountCheckbox = await extPage.waitForSelector('div[role="checkbox"]')
      await selectAccountCheckbox.click()

      let [confirmButton] = await extPage.$x('//button[text()="Confirm"]')
      await confirmButton.click()

      await extPage.waitForSelector('[data-testid="popup-loading-screen"]', {
        visible: true
      })

      await extPage.waitForSelector('[data-testid="popup-loading-screen"]', {
        hidden: true
      })

      await extPage.close()
      await optionPage.reload({ waitUntil: 'networkidle0' })

      /* ASSIGN ACCOUNT CARD VALUE */
      accountCardETH = await optionPage.waitForXPath(
        `//div[contains(text(), "${WALLET_ADDRESS.SOLANA_SENDER}")]/ancestor::div[@data-testid="account-card-setting-page"]`
      )

      /* CHECK SOL BALANCE */
      const balance = await accountCardETH.$(`[data-testid="account-card-balance"]`)
      const balanceText = await balance.evaluate((el) => el.textContent)
      const mainBalance = balanceText.split(' ')[1]
      const mainSymbol = balanceText.split(' ')[2]

      expect(Number(mainBalance)).toBeGreaterThan(0)
      expect(mainSymbol).toBe('SOL')

      const extendButton = await accountCardETH.$(
        `[data-testid="account-card-drop-down-${WALLET_ADDRESS.SOLANA_SENDER}"]`
      )
      await extendButton.click()

      const accountBalances = await accountCardETH.$(`[data-testid="account-card-account-balance"]`)
      const accountBalanceMain = await accountBalances.$(
        `[data-testid="account-card-account-balance-SOL"]`
      )
      let tokenBalance, tokenSymbol
      tokenBalance = (await accountBalanceMain.evaluate((el) => el.textContent)).split(' ')[0]
      tokenSymbol = (await accountBalanceMain.evaluate((el) => el.textContent)).split(' ')[1]
      expect(Number(tokenBalance)).toBeGreaterThan(0)
      expect(Number(tokenBalance)).toEqual(Number(mainBalance))
      expect(tokenSymbol).toBe('SOL')

      /* CHECK USDC BALANCE */
      const accountBalanceCustom = await accountBalances.$(
        `[data-testid="account-card-account-balance-USDC"]`
      )
      tokenBalance = (await accountBalanceCustom.evaluate((el) => el.textContent)).split(' ')[0]
      tokenSymbol = (await accountBalanceCustom.evaluate((el) => el.textContent)).split(' ')[1]
      expect(Number(tokenBalance)).toBeGreaterThan(0)
      expect(tokenSymbol).toBe('USDC')

      /* CHECK ETH ASSETS */
      const assets = await accountCardETH.$(`[data-testid="account-card-assets"]`)
      const assetsText = await assets.evaluate((el) => el.textContent)
      const assetsValue = assetsText.split(' ')[1]
      expect(Number(assetsValue)).toBeGreaterThanOrEqual(0)

      const nftAssets = await accountCardETH.$(`[data-testid="account-card-nft-assets"]`)
      const nftAssetsText = await nftAssets.evaluate((el) => el.textContent)
      const [nftAssetsValue, nftAssetsSymbol] = nftAssetsText.split(' ')
      expect(Number(nftAssetsValue)).toBeGreaterThanOrEqual(0)
      expect(Number(nftAssetsValue)).toEqual(Number(assetsValue))
      expect(nftAssetsSymbol).toBe('SOL')
    }, 100000)
  })

  describe('Copy address', () => {})
  describe('Change account name', () => {})
  // describe('Change account password', () => {})

  afterAll(async () => {
    await context.closePages()
  })
})
