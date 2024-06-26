import React, { useEffect, useMemo,useRef, useState } from 'react'
import clsx from 'clsx'
import DownIconBlue from 'img/v2/dropdown/down-icon-blue.svg'
import DownIconWhite from 'img/v2/dropdown/down-icon-white.svg'
import find from 'lodash/find'
import inclues from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

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
    wrapper: 'text-xs 2xl:text-sm 3xl:text-base',
    header: 'h-5 xl:h-6 2xl:h-7 3xl:h-8 pl-1 pr-5.5',
    row: 'pl-1 min-h-5'
  },
  lg: {
    wrapper: 'text-base 2xl:text-lg 3xl:text-xl',
    header: 'h-8 xl:h-9 2xl:h-10 3xl:h-12 pl-2 pr-9',
    row: 'pl-2 min-h-8'
  }
}

const DropDown = ({
  options,
  value,
  onChange,
  variant = 'dark',
  size = 'lg',
  emptyOption = false,
  filterSupported = true
}) => {
  const [listOpened, setListOpened] = useState(false)
  const [filterValue, setFilterValue] = useState('')

  const label = useMemo(() => find(options, { value })?.label || chrome.i18n.getMessage('noneSelect'), [options, value])

  const dropDownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setListOpened(false)
        setFilterValue(label)
      }
    }

    const handlePressingEsc = (event) => {
      if (event.defaultPrevented) {
        return // Should do nothing if the default action has been cancelled
      }

      if (event.key === 'Escape') {
        setListOpened(false)
        setFilterValue(label)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handlePressingEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handlePressingEsc)
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
      ref={dropDownRef}
      role="listbox"
    >
      <div className="flex items-center rounded-finnie" onClick={toggleList}>
        {filterSupported ? (
          <input
            className={clsx(
              'cursor-pointer w-full rounded-finnie flex-grow focus:outline-none',
              sizes[size].header,
              variants[variant].header
            )}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        ) : (
          <div
            className={clsx(
              'w-full flex items-center rounded-finnie flex-grow',
              sizes[size].header,
              variants[variant].header
            )}
            role="option"
          >
            {filterValue}
          </div>
        )}
        <div
          className={clsx(
            'absolute top-0 rounded-r-finnie flex items-center justify-center cursor-pointer bg-white',
            size === 'lg' ? 'w-8 xl:w-9 2xl:w-10 3xl:w-12 h-8 xl:h-9 2xl:h-10 3xl:h-12 -right-0.25' : 'w-5 xl:w-6 2xl:w-7 3xl:w-8 h-5 xl:h-6 2xl:h-7 3xl:h-8 right-0'
          )}
          role="button"
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
              {chrome.i18n.getMessage('noneSelect')}
            </button>
          )}
          {(filterValue !== '-- None' && filterSupported
            ? options.filter((item) => inclues(lowerCase(item.label), lowerCase(filterValue)))
            : options
          ).map((item, idx) => (
            <button
              className={clsx('text-left', sizes[size].row, variants[variant].row)}
              key={idx}
              onClick={() => selectItem(item)}
              role="option"
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
