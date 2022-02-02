import clsx from 'clsx'
import React from 'react'

import { includes } from 'lodash'

const NFTMedia = ({ contentType, source, showFull = false }) => {
  if (includes(contentType, 'image')) {
    return (
      <img
        src={source}
        className={clsx(
          'w-full h-full rounded',
          showFull ? 'object-contain bg-black' : 'object-cover'
        )}
      />
    )
  }
  if (includes(contentType, 'video')) {
    return (
      <video
        src={source}
        className={clsx(
          'w-full h-full rounded',
          showFull ? 'object-contain bg-black' : 'object-cover'
        )}
        muted
        controls
      />
    )
  }
  if (includes(contentType, 'audio')) {
    return (
      <audio
        src={source}
        className={clsx(
          'w-full h-full rounded',
          showFull ? 'object-contain bg-black' : 'object-cover'
        )}
        controls
      />
    )
  }
  if (includes(contentType, 'html')) {
    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full absolute top-0 left-0 bg-transparent"></div>
        <iframe className="w-full h-full rounded" frameBorder="0" src={source} />
      </div>
    )
  }

  return null
}

export default NFTMedia
