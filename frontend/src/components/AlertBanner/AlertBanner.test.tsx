import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import { AlertBanner } from "./AlertBanner"


describe("<AlertBanner>", () => {
    it("renders its children", () => {
        const alertText = "This is an alert!";
        render(
            <AlertBanner>
                <p>{alertText}</p>
            </AlertBanner>
        )
        expect(screen.getByText(alertText)).toBeInTheDocument();
    })

    it("is styled to be a USWDS alert warning (slim)", () => {
        const expectedClasses = ["usa-alert", "usa-alert--warning", "usa-alert--slim"]
        render(<AlertBanner>alert</AlertBanner>)
        const alertBanner = screen.getByTestId("alert-banner");
        for (const expectedClass of expectedClasses) {
            expect(alertBanner).toHaveClass(expectedClass)
        }

    })
})