import React from 'react'

export default ({ stage }) => {
  if (stage != 3)
    return (
      <>
        <div className='description-title'>Create an Atomic NFT</div>
        <div className='description-detail'>
          Drop your file here to store it forever and start earning attention
          rewards.
        </div>
      </>
    )

  return (
    <div className='upload-success'>
      <div className='description-title'>
        Congratulations! Your new NFT is ready for action
      </div>
      <div className='description-detail'>
        Share your newly minted NFT with everyone you know to start earning
        attention rewards.
      </div>
    </div>
  )
}