import { ReactNode } from "react"

interface Props {
    children: ReactNode
}

export const AlertBanner = (props: Props) => {
    return (
        <div
            data-testid="alert-banner"
            className="usa-alert usa-alert--warning usa-alert--slim"
        >
            <div className="usa-alert__body">
                <p className="usa-alert__text">
                    {props.children}
                </p>
            </div>
        </div>
    )
}