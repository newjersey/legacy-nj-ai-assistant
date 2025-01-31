import styles from './QuestionInput.module.css'
import icons from '@newjersey/njwds/dist/img/sprite.svg'

interface AlertProps {
  alertText: string
}

export const Alert = ({ alertText }: AlertProps) => {
  return (
    // <div className={`usa-alert ${extraClassNames}`}>
    //   <div className="usa-alert__body">
    //     <p className="usa-alert__text">{alertText}</p>
    //   </div>
    // </div>

    <div
      className={`usa-alert usa-alert--error usa-alert--slim margin-top-0 line-height-sans-5 width-full padding-y-0 position-relative display-flex flex-justify ${styles.errorAlert}`}
      data-testId="errorAlert">
      <div className="usa-alert__body">
        <p className="usa-alert__text maxw-none">{alertText}</p>
      </div>
      <button
        className={`usa-button usa-button--unstyled margin-right-1 ${styles.closeButton}`}
        aria-label="Close error alert"
        // onClick={e => setInputError('')}
      >
        <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use href={`${icons}#close`} />
        </svg>
      </button>
    </div>
  )
}
