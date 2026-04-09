module.exports = {
  preset: "jest-expo",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "\\.tflite$": "<rootDir>/test/__mocks__/tfliteMock.js",
  },
};
