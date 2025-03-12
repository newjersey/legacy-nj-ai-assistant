import React from "react";
import { jest } from "@jest/globals";

import "@testing-library/jest-dom";

jest.mock("framer-motion", () => ({
  motion: {
    div: (props: { children: React.ReactNode }) => (
      <div data-testid="motion-div">{props.children}</div>
    ),
  },
  AnimatePresence: ({children, onExitComplete}: {
    children: React.ReactNode;
    onExitComplete?: () => void;
  }) => {
    if (onExitComplete != null) {
      setTimeout(() => {
        onExitComplete();
      }, 10000);
    }

    return <>{children}</>;
  },
}));
