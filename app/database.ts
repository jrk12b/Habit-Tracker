import * as SQLite from 'expo-sqlite';
import { Habit } from './types'; 
const db = SQLite.openDatabaseSync('habits.db');

// Initialize the database with a table for habits
export const initDatabase = () => {
  db.execAsync(
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT NOT NULL
    );`
  ).then(() => console.log('Database initialized'))
   .catch(error => console.error('Error initializing database:', error));
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
