import { ChromeStorage } from '../ChromeStorage'
import { GENERIC } from 'constants/storageConstants'

export class GenericGet {
  #chrome
  constructor() {
    this.#chrome = new ChromeStorage()
  }
  /**
   * 
   * @returns {Object} Pending transaction object
   */
  async pendingRequest() {
    return await this.#chrome._getChrome(GENERIC.PENDING_REQUEST) || {}
  }
  /**
   * 
   * @returns {Number} Koi balance
   */
  koiBalance() {
    return this.#chrome._getChrome(GENERIC.KOI_BALANCE)
  }
  /**
   * 
   * @returns {String} 3 characters of currency. Example: 'USD'
   */
  selectedCurrency() {
    return this.#chrome._getChrome(GENERIC.SELECTED_CURRENCY)
  }
  /**
   * 
   * @returns {Array} Array of connected site origins.
   */
  connectedSites() {
    return this.#chrome._getChrome(GENERIC.CONNECTED_SITE)
  }
  /**
   * 
   * @returns {String} Name of this account.
   */
  accountName() {
    return this.#chrome._getChrome(GENERIC.ACCOUNT_NAME)
  }
  /**
   * 
   * @returns {String} Friend referral code
   */
  affiliateCode() {
    return this.#chrome._getChrome(GENERIC.AFFILIATE_CODE)
  }
  /**
   * 
   * @returns {Boolean} State of locked/unlocked
   */
  unlocked() {
    return this.#chrome._getChrome(GENERIC.UNLOCKED)
  }

  nftBitData() {
    return this.#chrome._getChrome(GENERIC.NFT_BIT_DATA)
  }

  activityNotifications() {
    return this.#chrome._getChrome(GENERIC.ACTIVITY_NOTIFICATIONS)
  }

  tokenPrice() {
    return this.#chrome._getChrome(GENERIC.TOKEN_PRICE)
  }

  async transactionData() {
    return this.#chrome._getChrome(GENERIC.TRANSACTION_DATA) || []
  }

  async savedNFTForm() {
    return this.#chrome._getChrome(GENERIC.SAVED_NFT_FORM) || {}
  }
}