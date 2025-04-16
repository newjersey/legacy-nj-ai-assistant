import React from "react";
import { afterAll, beforeAll, jest } from "@jest/globals";

import "@testing-library/jest-dom";
import * as CoachMark from "./src/components/CoachMark/CoachMark"
import { DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY } from "./src/utils/coachMarkUtils";

jest.mock("framer-motion", () => ({
  motion: {
    div: (props: { children: React.ReactNode }) => (
      <div data-testid="motion-div">{props.children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  },
}));

beforeAll(async () => {
  localStorage.setItem(DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY, JSON.stringify(true))
})

afterAll( () => {
  localStorage.clear()
})
