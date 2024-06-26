import React from 'react'
import loadingIcon from 'img/loading-icon.gif'

import './index.css'

export default () => {
  return (
    <div className="loading-screen">
      <img className="loading-icon" src={loadingIcon} />
    </div>
  )
}
