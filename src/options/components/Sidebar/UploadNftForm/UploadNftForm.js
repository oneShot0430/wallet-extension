import React, { useEffect, useMemo, useRef, useState } from 'react'
import CrossIcon from 'img/v2/cross-icon.svg'
import capitalize from 'lodash/capitalize'
import initial from 'lodash/initial'
import isEmpty from 'lodash/isEmpty'
import union from 'lodash/union'
import Button from 'options/components/Button'
import CheckBox from 'options/components/CheckBox'
import ConfirmCreateNftModal from 'options/components/ConfirmCreateNftModal'
import DropFile from 'options/components/DropFile'
import InputField from 'options/components/InputField'
import NFTMedia from 'options/components/NFTMedia'
import ToolTip from 'options/components/ToolTip'
import formatLongString from 'options/utils/formatLongString'
import { getFileType } from 'options/utils/getFileType'

import './UploadNftForm.css'

const UploadNftForm = () => {
  const [nftContent, setNftContent] = useState({
    title: '',
    owner: '',
    description: '',
    isNSFW: false
  })

  const [errors, setErrors] = useState({
    title: '',
    owner: '',
    description: '',
    file: ''
  })

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [file, setFile] = useState({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const titleFieldRef = useRef(null)
  const tagFields = useRef(null)

  const fileType = useMemo(() => getFileType(file), [file])
  const url = useMemo(() => {
    try {
      if (file) {
        const _url = URL.createObjectURL(file)
        return _url
      }
      return ''
    } catch (err) {
      console.log('INPUT ERROR - IMAGE', err.message)
    }
  }, [file])

  useEffect(() => {
    if (!isEmpty(file)) {
      setErrors((prev) => ({ ...prev, file: '' }))
    }
  }, [file])

  useEffect(() => {
    const tagNode = tagFields.current
    if (tagNode) {
      tagNode.scrollTop = tagNode.scrollHeight
    }
  }, [tags])

  const handleNftContentChange = (e) => {
    setErrors({
      title: '',
      owner: '',
      description: '',
      file: ''
    })
    setNftContent({ ...nftContent, [e.target.name]: e.target.value })
  }

  const handleTagsKeyUp = (e) => {
    if (e.key === ' ' && tagInput.endsWith(', ')) {
      const newTags = initial(tagInput.split(','))
      setTags(union(tags, newTags))
      setTagInput('')
    }
  }

  const removeTag = (removeTag) => {
    setTags(tags.filter((tag) => tag !== removeTag))
  }

  const validateForm = () => {
    const keys = ['title', 'description']
    let isValid = true

    for (const key of keys) {
      if (isEmpty(nftContent[key])) {
        isValid = false
        setErrors((prev) => ({ ...prev, [key]: `${capitalize(key)} cannot be empty` }))
        titleFieldRef.current.scrollIntoView()
      }
    }

    if (isEmpty(file)) {
      isValid = false
      setErrors((prev) => ({ ...prev, file: 'Please select a file' }))
    }

    return isValid
  }

  const handleCreateNFT = () => {
    if (validateForm()) {
      setShowConfirmModal(true)
    }
  }

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
  }

  const resetState = () => {
    setNftContent({ title: '', owner: '', description: '', isNSFW: false })
    setTagInput('')
    setTags([])
    setFile({})
  }

  return (
    <>
      <div
        className="flex flex-col px-4 pt-4 pb-8 cursor-not-allowed"
        data-tip={chrome.i18n.getMessage('featureUnderConstruction')}
        data-for="under-construction"
      >
        <ToolTip id="under-construction" />
        <div ref={titleFieldRef}>
          <InputField
            className="my-1 pointer-events-none"
            label={chrome.i18n.getMessage('uploadNFTTitleLabel')}
            value={nftContent.title}
            setValue={handleNftContentChange}
            required={true}
            name="title"
            error={errors.title}
            placeholder={chrome.i18n.getMessage('uploadNFTTitlePh')}
          />
        </div>
        <InputField
          className="my-1 pointer-events-none"
          label={chrome.i18n.getMessage('description')}
          value={nftContent.description}
          setValue={handleNftContentChange}
          required={true}
          type="textarea"
          name="description"
          error={errors.description}
          placeholder={chrome.i18n.getMessage('uploadNFTDescPh')}
          maxHeight={200}
        />
        <div className="my-1 flex flex-col w-full pointer-events-none">
          <label htmlFor="tags" className="w-full uppercase text-lightBlue text-2xs leading-3 mb-1">
            {chrome.i18n.getMessage('tags') + ','}
          </label>
          <input
            className="w-full bg-trueGray-100 bg-opacity-10 border-b border-white h-5.25 text-white px-1 upload-nft-tag-input"
            name="tags"
            placeholder={chrome.i18n.getMessage('tagsPh')}
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyUp={(e) => handleTagsKeyUp(e)}
          />
        </div>
        <div
          ref={tagFields}
          className="max-h-19 w-full flex flex-wrap gap-1 overflow-y-scroll mt-1 mb-5 pointer-events-none"
        >
          {tags.map((tag) => (
            <div
              onClick={() => removeTag(tag)}
              key={tag}
              className="max-h-3.75 flex justify-evenly items-center rounded-full bg-lightBlue text-2xs py-0.5 px-1.5 cursor-pointer"
            >
              <CrossIcon className="mr-0.5 w-1.75 h-1.75" />
              {formatLongString(tag, 25)}
            </div>
          ))}
        </div>

        <div className="flex mb-4 cursor-pointer pointer-events-none">
          <CheckBox
            checked={nftContent.isNSFW}
            onClick={() => setNftContent((prev) => ({ ...prev, isNSFW: !prev.isNSFW }))}
            theme="dark"
            className="w-3.75 h-3.75"
          />
          <div
            className="text-white ml-2 text-11px select-none"
            onClick={() => setNftContent((prev) => ({ ...prev, isNSFW: !prev.isNSFW }))}
          >
            {chrome.i18n.getMessage('thisContentIs')}
            <span className="text-warning">{chrome.i18n.getMessage('explicitMsg')}</span>
          </div>
        </div>
        {isEmpty(file) ? (
          <div className="w-50 h-36.25 border border-dashed border-success rounded pointer-events-none">
            <DropFile
              file={file}
              setFile={setFile}
              fileType={['image/*', 'video/*', 'audio/*']}
              className="w-full h-full"
              description={chrome.i18n.getMessage('clickToUploadNFT')}
            />
          </div>
        ) : (
          <div className="w-50 relative object-cover pointer-events-none">
            <CrossIcon
              onClick={() => setFile({})}
              className="z-50 absolute top-2 right-2 w-4 h-4 cursor-pointer bg-white bg-opacity-60 rounded-full p-1 shadow-lg"
            />
            <NFTMedia contentType={fileType} source={url} />
          </div>
        )}
        <span className="text-3xs text-bittersweet-200 mb-4.25 pointer-events-none">
          {errors.file}
        </span>

        <Button
          onClick={handleCreateNFT}
          variant="light"
          text={chrome.i18n.getMessage('createNFT')}
          className="text-sm pointer-events-none"
          disabled
        />
      </div>
      {showConfirmModal && (
        <ConfirmCreateNftModal
          nftContent={nftContent}
          tags={tags}
          fileType={file?.type}
          url={url}
          close={closeConfirmModal}
          resetState={resetState}
        />
      )}
    </>
  )
}

export default UploadNftForm
