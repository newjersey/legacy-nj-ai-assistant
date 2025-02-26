import '@testing-library/jest-dom'
import { getByTestId, render, screen } from "@testing-library/react"
import { AlertBanner } from "./AlertBanner"


describe("<AlertBanner>", () => {
    it("renders the 'messageHtml' prop in a paragraph element with the 'usa-alert__text' class", () => {
        const alertHtml = "This is an alert!";
        render(
            <AlertBanner messageHtml={alertHtml} />
        )
        const alertTextElement = screen.getByText(alertHtml)
        expect(alertTextElement).toBeInTheDocument();
        expect(alertTextElement).toHaveRole("paragraph");
        expect(alertTextElement).toHaveClass("usa-alert__text")
    })

    it("renders the 'messageHtml' prop as unescaped HTML within the alert text paragraph element", () => {
        const spanTestId = "alert-text-inner-span"
        const alertHtml = `
            <span data-testid='${spanTestId}'>
                Important:
            </span> there is an alert`;
        render(
            <AlertBanner messageHtml={alertHtml} />
        )
        const alertTextElement = screen.getByText("there is an alert")
        expect(alertTextElement).toHaveRole("paragraph");
        expect(getByTestId(alertTextElement, spanTestId)).toBeInTheDocument();
    })

    it("is styled to be a USWDS info alert (slim, no icon)", () => {
        const expectedClasses = ["usa-alert", "usa-alert--info", "usa-alert--slim", "usa-alert--no-icon"]
        render(<AlertBanner messageHtml="" />)
        const alertBanner = screen.getByTestId("alert-banner");
        for (const expectedClass of expectedClasses) {
            expect(alertBanner).toHaveClass(expectedClass)
        }

    })
})