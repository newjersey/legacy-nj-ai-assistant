import { render } from "@testing-library/react"
import { AlertBanner } from "./AlertBanner"

describe("<AlertBanner>", () => {
    it("renders its children", () => {
        render(
            <AlertBanner>
                <p>This is an alert!</p>
            </AlertBanner>
        )
    })
})