import * as SQLite from 'expo-sqlite';
import { Habit } from './types'; 
const db = SQLite.openDatabaseSync('habits.db');

export const initDatabase = async () => {
  try {

    // await db.execAsync(`DROP TABLE IF EXISTS habit_entries;`);
    // await db.execAsync(`DROP TABLE IF EXISTS habits;`);
    // await db.execAsync(`DROP TABLE IF EXISTS users;`);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        uid TEXT UNIQUE,
        password TEXT
      );
    `);

    const log = await db.getAllAsync('SELECT * FROM users');
    console.log('derp: ', log);

    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,  -- user_id must match users.id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const log2 = await db.getAllAsync('SELECT * FROM habits');
    console.log('derp3: ', log2);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        habit_id INTEGER NOT NULL,
        completed BOOLEAN NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Database initialized with user-specific tables");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

// Add a new user if they don’t exist, return the user ID
export const addUser = async (uid: string, password: string): Promise<number> => {
  if (!uid || !password) {
    console.error("UID or Password is empty or undefined");
    throw new Error("UID and password are required");
  }

  try {
    console.log("Inserting user with UID:", uid, "and password:", password);

    // Use runAsync for parameterized queries
    await db.runAsync(
      `INSERT INTO users (uid, password) VALUES (?, ?)`, 
      [uid, password]
    );

    const result = await db.getFirstAsync<{ id: number }>(
      `SELECT last_insert_rowid() as id;`
    );

    return result?.id ?? -1; // Return the new user ID
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Get user ID by their UID
export const getUserByUid = async (uid: string): Promise<number | null> => {
  try {
    const result = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM users WHERE uid = ?`, [uid]
    );
    return result?.id ?? null;
  } catch (error) {
    console.error("Error fetching user by UID:", error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<{ id: number; uid: string } | null> => {
  try {
    const result = await db.getFirstAsync<{ id: number; uid: string }>(
      `SELECT id, uid FROM users WHERE id = ?`, [id]
    );
    return result ?? null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

// Add a new habit
export const addHabit = async (name: string, userId: number, callback: (id?: number) => void) => {
  if (!name || name.trim() === '') {
    console.error('Habit name cannot be empty');
    return; // Prevent inserting if the name is invalid
  }

  if (!userId) {
    console.error('Invalid user ID');
    return; // Prevent inserting if user ID is invalid
  }

  console.log('name: ', name);   // Correctly log the habit name
  console.log('userId: ', userId);  // Log the userId correctly
  try {
    await db.runAsync(
      `INSERT INTO habits (name, user_id) VALUES (?, ?)`, 
      [name, userId]
    );
    const result = await db.getFirstAsync<{ id: number }>(`SELECT last_insert_rowid() as id;`);
    callback(result?.id);
  } catch (error) {
    console.error("Error adding habit:", error);
  }
};

// Load all habits from the database
export const loadHabits = async (userId: number): Promise<Habit[]> => {
  try {
    const habits = await db.getAllAsync<{ id: number; name: string }>(
      `SELECT * FROM habits WHERE user_id = ?`, [userId]
    );
    return habits.map(habit => ({ ...habit, completed: false }));
  } catch (error) {
    console.error('Error loading habits:', error);
    return [];
  }
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

// Delete all existing habit entries - used for deleting test data
export const deleteAllHabitEntries = async () => {
  const db = getDb();
  try {
    await db.execAsync(`DELETE FROM habit_entries`);
    console.log("All habit entries deleted successfully");
  } catch (error) {
    console.error("Error deleting habit entries:", error);
  }
};

// return an instance of the db
export const getDb = () => db;
