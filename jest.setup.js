import "@testing-library/jest-native/extend-expect";

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => "server-ts"),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  deleteObject: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  initializeAuth: jest.fn(() => ({ currentUser: null })),
  getReactNativePersistence: jest.fn(),
  signOut: jest.fn(),
}));
