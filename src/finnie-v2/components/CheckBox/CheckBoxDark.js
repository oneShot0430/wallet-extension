import clsx from 'clsx'
import React from 'react'

import CheckIcon from 'img/v2/check-icon-orange.svg'

const CheckBoxDark = ({ onClick, checked = false, className, ...props }) => {
  return (
    <div
      className={clsx(
        'w-4 h-4 inline-block border border-white rounded-sm cursor-pointer shadow',
        checked && 'flex justify-center items-center',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {checked ? <CheckIcon className="w-2.25 h-1.75" /> : null}
    </div>
  )
}

export default CheckBoxDark
