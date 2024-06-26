import { MESSAGES } from 'constants/koiConstants'

import { Request } from './request'

export class AssetRequest extends Request {
  constructor(backgroundConnect) {
    super(backgroundConnect)
  }

  /**
   * 
   * @returns {Object} contentList: [{nft}, {nft}]
   */
  loadContent(body) {
    return this.promise(MESSAGES.LOAD_CONTENT, body)
  }

  loadAllContent() {
    return this.promise(MESSAGES.LOAD_CONTENT)
  }
}
