import React from "react";
import { jest } from "@jest/globals";

import "@testing-library/jest-dom";

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
