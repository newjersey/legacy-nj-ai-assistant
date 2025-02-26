interface Props {
    messageHtml: string
}

export const AlertBanner = (props: Props) => {
    return (
        <div
            data-testid="alert-banner"
            className="usa-alert usa-alert--info usa-alert--slim usa-alert--no-icon"
        >
            <div className="usa-alert__body">
                <p className="usa-alert__text"
                    dangerouslySetInnerHTML={{ __html: props.messageHtml }}
                />
            </div>
        </div>
    )
}