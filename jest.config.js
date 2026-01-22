module.exports = {
  preset: "jest-expo",
  testMatch: ["**/*.jest.test.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?|expo-router|react-navigation|@react-navigation|@testing-library/react-native|react-native-svg|expo-image|@unimodules|unimodules)",
  ],
};
