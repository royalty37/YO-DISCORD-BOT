import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

type StoreData = Record<string, unknown>;

// Ensure data directory and file exist
const ensureStore = (): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
};

// Read the entire store
const readStore = (): StoreData => {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
};

// Write the entire store
const writeStore = (data: StoreData): void => {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Get a value by key
export const getData = <T>(key: string): T | null => {
  const store = readStore();
  return (store[key] as T) ?? null;
};

// Set a value by key
export const setData = <T>(key: string, value: T): void => {
  const store = readStore();
  store[key] = value;
  writeStore(store);
};

// Delete a value by key
export const deleteData = (key: string): void => {
  const store = readStore();
  delete store[key];
  writeStore(store);
};

// Get all keys matching a prefix
export const getKeysByPrefix = (prefix: string): string[] => {
  const store = readStore();
  return Object.keys(store).filter((key) => key.startsWith(prefix));
};
