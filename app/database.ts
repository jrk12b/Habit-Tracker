import * as SQLite from 'expo-sqlite';
import { Habit } from './types'; 
const db = SQLite.openDatabaseSync('habits.db');

// Initialize the database with tables for habits and habit_entries
export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        habit_id INTEGER NOT NULL,
        completed BOOLEAN NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id)
      );
    `);
    
    console.log("✅ Database initialized with tables");

    const habitEntries = await db.getAllAsync<{ id: number; date: string; habit_id: number; completed: boolean }>(
      "SELECT * FROM habit_entries;"
    );

    const habits = await db.getAllAsync<{ id: number; name: string }>("SELECT * FROM habits;");

  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

// Add a new habit
export const addHabit = (name: string, callback: (id?: number) => void) => {
  db.execAsync(`INSERT INTO habits (name) VALUES ('${name}');`)
    .then(() => db.getFirstAsync<{ id: number }>(`SELECT last_insert_rowid() as id;`))
    .then(result => callback(result?.id))
    .catch(error => console.error('Error adding habit:', error));
};

// Load all habits from the database
export const loadHabits = (): Promise<Habit[]> => {
  return db.getAllAsync<{ id: number; name: string }>('SELECT * FROM habits;')
    .then(habits => habits.map(habit => ({ ...habit, completed: false }))) // Add default completed: false
    .catch(error => {
      console.error('Error loading habits:', error);
      return [];
    });
};

// Update an existing habit
export const updateHabit = (id: number, newName: string): Promise<void> => {
  return db.execAsync(`UPDATE habits SET name = '${newName}' WHERE id = ${id};`)
    .catch(error => console.error('Error updating habit:', error));
};


// Delete a habit by its ID
export const deleteHabit = (id: number, callback: () => void) => {
  db.execAsync(`DELETE FROM habits WHERE id = ${id};`)
    .then(() => callback())
    .catch(error => console.error('Error deleting habit:', error));
};

export const deleteAllHabitEntries = async () => {
  const db = getDb();
  try {
    await db.execAsync(`DELETE FROM habit_entries`);
    console.log("All habit entries deleted successfully");
  } catch (error) {
    console.error("Error deleting habit entries:", error);
  }
};

export const getDb = () => db;