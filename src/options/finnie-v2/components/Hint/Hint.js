import React from 'react'
import clsx from 'clsx'
import ToolTip from 'finnie-v2/components/ToolTip'
import QuestionMarkBlue from 'img/v2/question-mark-icon-blue.svg'
import QuestionMarkWhite from 'img/v2/question-mark-icon-white.svg'

const Hint = ({ text, className, variant = 'blue', ...props }) => {
  return (
    <>
      {variant === 'blue' ? (
        <QuestionMarkBlue
          data-for={`hint-${text.replaceAll(' ', '')}`}
          className={clsx('w-5.5 focus:outline-none', className)}
          data-tip={text}
        />
      ) : (
        <QuestionMarkWhite
          data-for="hint"
          data-for={`hint-${text.replaceAll(' ', '')}`}
          className={clsx('w-5.5 focus:outline-none', className)}
          data-tip={text}
        />
      )}
      <ToolTip id={`hint-${text.replaceAll(' ', '')}`} {...props} />
    </>
  )
}

export default Hint
