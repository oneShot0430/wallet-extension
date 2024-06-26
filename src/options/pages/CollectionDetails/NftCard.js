import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import KoiiLogo from 'img/v2/koii-logos/finnie-koii-logo-blue.svg'
import { get } from 'lodash'
import NFTMedia from 'options/components/NFTMedia'
import { GalleryContext } from 'options/galleryContext'
import getAssetByTxId from 'options/selectors/getAssetByTxId'
import formatLongString from 'options/utils/formatLongString'
import formatNumber from 'options/utils/formatNumber'

export default ({ nft }) => {
  const { showViews, showEarnedKoi } = useContext(GalleryContext)
  const nftInfo = useSelector(getAssetByTxId(nft))

  return (
    <Link
      to={`/nfts/${get(nftInfo, 'txId')}`}
      className="relative text-white rounded bg-blue-800 w-46.75 h-62.5 pt-1.75 px-1.75"
    >
      <div className="flex justify-center items-center w-full h-37.75">
        <NFTMedia contentType={get(nftInfo, 'contentType')} source={get(nftInfo, 'imageUrl')} />
      </div>
      <div className="pl-1.75 flex flex-col mt-3.75 gap-y-1">
        <div className="font-semibold text-xs tracking-finnieSpacing-wide h-8 text-ellipsis overflow-hidden">
          {get(nftInfo, 'name')}
        </div>
        <div className="text-2xs tracking-finnieSpacing-wide text-warning">
          {formatLongString(get(nft, 'collection')?.join(', '), 22)}
        </div>
        {showViews && (
          <div className="text-2xs tracking-finnieSpacing-wide text-turquoiseBlue">
            {get(nftInfo, 'totalViews') + ` views`}
          </div>
        )}
        {showEarnedKoi && (
          <div className="text-2xs tracking-finnieSpacing-wide text-lightBlue">
            {formatNumber(get(nftInfo, 'earnedKoi'), 2) + ` KOII earned`}
          </div>
        )}
      </div>
      <KoiiLogo className="absolute w-5 h-5 bottom-1.75 right-1.75" />
    </Link>
  )
}
