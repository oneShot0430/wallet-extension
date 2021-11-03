// modules
import React, { useState } from 'react'

// assets
import ToggleDisplayIcon from 'img/toggle-display.svg'

// styles
import './index.css'


export default React.forwardRef(({
  label,
  value,
  onChange,
  name = '',
  placeholder = '',
  className = '',
  type = 'password',
}, ref) => {
  const [isDisplay, setDisplay] = useState(false)
  const toggleDisplay = () => {
    setDisplay(!isDisplay)
    console.log(type)
  }

  return (
    <div className={`input-field ${className}`}>
      <div className='label'>{label}</div>
      <div className='input-wrapper'>
        <input
          name={name}
          className='input'
          type={isDisplay ? 'text' : type}
          defaultValue={value}
          onChange={onChange}
          placeholder={placeholder}
          step='any'
          ref={ref}
        ></input>
        < ToggleDisplayIcon className='toggle-display' onClick={toggleDisplay} />
      </div>
    </div>
  )
})
