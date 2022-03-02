import clsx from 'clsx'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import find from 'lodash/find'
import inclues from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import DownIconBlue from 'img/v2/dropdown/down-icon-blue.svg'
import DownIconWhite from 'img/v2/dropdown/down-icon-white.svg'

const variants = {
  dark: {
    wrapper: 'border border-white bg-blue-800',
    header: 'border-b-white text-white bg-blue-800',
    body: 'border border-white bg-blue-800 ',
    row: 'hover:bg-lightBlue hover:text-blue-600'
  },
  light: {
    wrapper: 'border border-blue-800 bg-blue-600',
    header: 'border-b-blue-800 text-white bg-blue-600',
    body: 'border border-blue-800 bg-blue-600 text-white',
    row: 'hover:bg-lightBlue hover:text-blue-600'
  }
}

const sizes = {
  sm: {
    wrapper: 'text-xs',
    header: 'h-5 pl-1',
    row: 'pl-1 min-h-5'
  },
  lg: {
    wrapper: 'text-base',
    header: 'h-8 pl-2',
    row: 'pl-2 min-h-8'
  }
}

const DropDown = ({
  options,
  value,
  onChange,
  variant = 'dark',
  size = 'lg',
  emptyOption = false
}) => {
  const [listOpened, setListOpened] = useState(false)
  const [filterValue, setFilterValue] = useState('')

  const label = useMemo(() => find(options, { value })?.label || '-- None', [options, value])

  const dropDownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setListOpened(false)
        setFilterValue(label)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropDownRef, label])

  useEffect(() => {
    setFilterValue(find(options, { value })?.label || '-- None')
  }, [options, value])

  const toggleList = () => {
    setListOpened((prev) => !prev)
  }

  const selectItem = (item) => {
    setListOpened(false)
    setFilterValue(item.label)
    onChange(item.value)
  }

  return (
    <div
      className={clsx(
        'w-full relative text-left rounded-finnie',
        sizes[size].wrapper,
        variants[variant].wrapper
      )}
    >
      <div className="flex items-center rounded-finnie" onClick={toggleList}>
        <input
          className={clsx(
            'cursor-pointer rounded-finnie flex-grow',
            sizes[size].header,
            variants[variant].header
          )}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <div
          className={clsx(
            'absolute top-0 rounded-r-finnie flex items-center justify-center bg-white',
            size === 'lg' ? 'w-8 h-8 -right-0.25' : 'w-5 h-5 right-0'
          )}
        >
          <DownIconBlue className="h-1.75 w-3.25" />
        </div>
      </div>
      {listOpened && (
        <div
          className={clsx(
            'z-50 absolute w-full max-h-72 flex flex-col overflow-y-auto rounded-b-finnie select-none',
            variants[variant].body
          )}
          ref={dropDownRef}
        >
          {emptyOption && (
            <button
              className={clsx('text-left', sizes[size].row, variants[variant].row)}
              key="emptyOption"
              onClick={() =>
                selectItem({
                  label: '-- None',
                  value: ''
                })
              }
            >
              -- None
            </button>
          )}
          {options
            .filter((item) => inclues(lowerCase(item.label), lowerCase(filterValue)))
            .map((item, idx) => (
              <button
                className={clsx('text-left', sizes[size].row, variants[variant].row)}
                key={idx}
                onClick={() => selectItem(item)}
              >
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default DropDown
