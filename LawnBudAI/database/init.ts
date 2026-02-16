import { openDatabase } from 'expo-sqlite';
const db = openDatabase('lawncare.db');

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS mow_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        height REAL,
        notes TEXT
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS water_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount REAL,
        source TEXT,
        notes TEXT
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS weather_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        temperature REAL,
        precipitation REAL,
        humidity REAL,
        wind_speed REAL
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS fertilizer_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT,
        amount REAL,
        notes TEXT
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS soil_samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        nitrogen REAL,
        phosphorus REAL,
        potassium REAL,
        ph REAL,
        notes TEXT
      );
    `);
  });
};
