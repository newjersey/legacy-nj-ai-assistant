import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/polyfills.js", "jest-canvas-mock", "<rootDir>/jest.setup.tsx"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.svg$": "<rootDir>/__mocks__/fileMock.ts",
    "react-markdown": "react-markdown/react-markdown.min.js",
    "rehype-raw": "<rootDir>/__mocks__/rehypeRaw.ts",
    "remark-gfm": "<rootDir>/__mocks__/remarkGfm.ts",
    "remark-supersub": "<rootDir>/__mocks__/remarkSupersub.ts",
  },
  testEnvironment: "jsdom",
  silent: true,
};

export default config;
