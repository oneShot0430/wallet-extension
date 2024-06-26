import React from 'react'
import Avatar from 'img/ab-avatar.png'

const CreateNewContact = ({ goToCreateForm, goToImportFromDID }) => {
  return (
    <div
      style={{
        width: '411px',
        height: '486px',
        backgroundColor: '#3E3E71',
        boxShadow: 'inset 8px 0 10px -6px rgba(0, 0, 0, 0.16)',
        borderRadius: '0px 4px 4px 0px'
      }}
      className="flex flex-col items-center justify-center"
    >
      <img className="w-22 h-22" src={Avatar} alt="avatar" />
      <h1 className="font-semibold text-success text-base my-7">
        {chrome.i18n.getMessage('createNewContact')}
      </h1>
      <button
        onClick={goToCreateForm}
        className="rounded-sm shadow-md text-center text-indigo bg-trueGray-100 text-sm"
        style={{ width: '238px', height: '38px' }}
      >
        {chrome.i18n.getMessage('enterInfoManually')}
      </button>
      {/* <button
        onClick={goToImportFromDID}
        className="rounded-sm shadow-md text-center text-indigo bg-success text-sm mt-6.25"
        style={{ width: '238px', height: '38px' }}
      >
        {chrome.i18n.getMessage('importDIDLink')}
      </button> */}
    </div>
  )
}

export default CreateNewContact
