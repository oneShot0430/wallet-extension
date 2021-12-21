import clsx from 'clsx'
import React, { useState } from 'react'

import { TYPE } from 'constants/accountConstants'
import ArrowIcon from 'img/v2/arrow-icon.svg'
import FilterIcon from 'img/v2/filter-icon.svg'
import MagnifierIcon from 'img/v2/magnifier-icon.svg'

const SortAndFilter = ({ handleSearchFieldChange, handleSelectChains, selectedChain }) => {
  const [showFilterChains, setShowFilterChains] = useState(false)

  return (
    <div>
      <div className="relative w-full">
        <input
          className="w-full h-8.5 pl-3.5 pr-11.25 rounded-t text-indigo-900 font-light text-sm placeholder-current"
          placeholder="Search NFTs"
          onChange={(e) => handleSearchFieldChange(e.target.value)}
        ></input>
        <MagnifierIcon className="absolute top-2 right-5 w-4.75 h-4.75 cursor-pointer" />
      </div>
      <div className="px-2 pb-9">
        <div className="flex items-center justify-between h-12 pl-1.5 pr-3 font-semibold text-sm text-white">
          Filters
          <FilterIcon className="w-5.25 h-5.25 cursor-pointer" />
        </div>
        <hr className="rounded bg-white" />
        <div
          onClick={() => setShowFilterChains(!showFilterChains)}
          className="flex items-center justify-between h-12 pl-1.5 pr-3 font-semibold text-sm text-white cursor-pointer"
        >
          Chains
          <ArrowIcon
            className={clsx(showFilterChains && 'transform rotate-90', 'w-1.5 h-3 cursor-pointer')}
          />
        </div>
        <hr className="rounded border border-trueGray-100 border-opacity-20" />
        {showFilterChains && (
          <div className="flex text-white text-xs justify-between items-center text-center mt-2.75">
            <div
              className={clsx(
                selectedChain === TYPE.ETHEREUM ? 'bg-lightBlue text-indigo' : 'border-white',
                'h-7 w-24 border text-white text-xs rounded flex items-center justify-center cursor-pointer finnieSpacing-wider'
              )}
              onClick={() => handleSelectChains(TYPE.ETHEREUM)}
            >
              Ethereum
            </div>
            <div
              className={clsx(
                selectedChain === TYPE.ARWEAVE ? 'bg-lightBlue text-indigo' : 'border-white',
                'h-7 w-24 border border-white rounded flex items-center justify-center cursor-pointer finnieSpacing-wider'
              )}
              onClick={() => handleSelectChains(TYPE.ARWEAVE)}
            >
              Arweave
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SortAndFilter
