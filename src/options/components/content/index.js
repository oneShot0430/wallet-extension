import React, { useEffect, useContext, useRef } from 'react'
import get from 'lodash/get'
import includes from 'lodash/includes'
import find from 'lodash/find'
import toLower from 'lodash/toLower'
import isEqual from 'lodash/isEqual'

import { GalleryContext } from 'options/galleryContext'
import CreateCollection from 'options/components/collections/CreateCollection'

import Card from './nftCard'
import BigCard from './bigNFTCard'

import './index.css'

export default ({ choosenTxid = '', detail }) => {
  const { cardInfos, isDragging, searchTerm, showCreateCollection } = useContext(GalleryContext)

  // useEffect(() => {
  //   if (!showCreateCollection) window.scroll({ top: 0, behavior: 'smooth' }) 
  // }, [choosenTxid])

  const choosenCard = find(cardInfos, { txId: choosenTxid })

  return (
    <div className='app-content'>
      {!choosenCard && <div className='title'>Gallery</div>}
      {showCreateCollection && <div className='create-collection-container'>
        <CreateCollection />
      </div>}
      <div className='cards'>
        {choosenCard && <BigCard {...choosenCard} />}
        {!detail && <div className='small-cards'>
          {cardInfos.map(
            (cardInfo) =>
              isEqual(get(cardInfo, 'txId', ''), choosenTxid) ||
              (includes(
                toLower(get(cardInfo, 'name', '')),
                toLower(searchTerm)
              ) && (
                <Card
                  key={get(cardInfo, 'txId', '')}
                  disabled={isDragging}
                  choosen={choosenTxid}
                  {...cardInfo}
                />
              ))
          )}
        </div>}
      </div>
    </div>
  )
}
