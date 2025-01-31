import { Alert } from './Alert'

import styles from './QuestionInput.module.css'

interface Alert {
  id: number
  message: string
}

interface Props {
  alerts: string[]
}

export const AlertContainer = ({ alerts }: Props) => {
  return (
    <div className={`alertContainer display-flex flex-column position-absolute width-full  ${styles.errorAlertContainer}`}>
      {alerts.map(alert => (
        <Alert alertText={alert} />
      ))}
    </div>
  )
}
