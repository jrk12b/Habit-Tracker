import * as SQLite from 'expo-sqlite';
import { Database } from '@sqlitecloud/drivers';
import { Habit } from './types'; 
const local_db = SQLite.openDatabaseSync('habits.db');
const cloudDb = new Database("sqlitecloud://cyzlhxothz.g6.sqlite.cloud:8860/chinook.sqlite?apikey=dHQVRZ2o9iqdOz7VzL7bTy9efGvLEjx6iyvbIqmCiY0");

export const syncLocalDataToCloud = async () => {
  try {
    const localHabits = await local_db.getAllAsync<Habit>(`SELECT * FROM habits`);

    for (const habit of localHabits) {
      await cloudDb.sql`
        INSERT OR IGNORE INTO habits (id, name, user_id) 
        VALUES (${habit.id}, ${habit.name}, ${habit.userId})`;
    }

    console.log("✅ Local data synced to SQLiteCloud");
  } catch (error) {
    console.error("❌ Error syncing local data:", error);
  }
};

export const initDatabase = async () => {
  try {

    // await db.execAsync(`DROP TABLE IF EXISTS habit_entries;`);
    // await db.execAsync(`DROP TABLE IF EXISTS habits;`);
    // await db.execAsync(`DROP TABLE IF EXISTS users;`);
    await local_db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        uid TEXT UNIQUE,
        password TEXT
      );
    `);

    const log = await local_db.getAllAsync('SELECT * FROM users');
    console.log('derp: ', log);

    
    await local_db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,  -- user_id must match users.id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const log2 = await local_db.getAllAsync('SELECT * FROM habits');
    console.log('derp3: ', log2);
    
    await local_db.execAsync(`
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

    await syncLocalDataToCloud();
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
    await local_db.runAsync(
      `INSERT INTO users (uid, password) VALUES (?, ?)`, 
      [uid, password]
    );

    const result = await local_db.getFirstAsync<{ id: number }>(
      `SELECT last_insert_rowid() as id;`
    );

    return result?.id ?? -1; // Return the new user ID
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Get user ID by their UID
export const getUserByUid = async (uid: string): Promise<{ id: number; uid: string; password: string } | null> => {
  try {
    // Ensure the query retrieves the password field along with id and uid
    const result = await local_db.getFirstAsync<{ id: number; uid: string; password: string }>(
      `SELECT id, uid, password FROM users WHERE uid = ?`,
      [uid]
    );

    return result ?? null; // If no user found, return null
  } catch (error) {
    console.error("Error fetching user by UID:", error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<{ id: number; uid: string } | null> => {
  try {
    const result = await local_db.getFirstAsync<{ id: number; uid: string }>(
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
    await local_db.runAsync(
      `INSERT INTO habits (name, user_id) VALUES (?, ?)`, 
      [name, userId]
    );
    const result = await local_db.getFirstAsync<{ id: number }>(`SELECT last_insert_rowid() as id;`);

    await cloudDb.sql`INSERT INTO habits (name, user_id) VALUES (${name}, ${userId})`;
    callback(result?.id);
  } catch (error) {
    console.error("Error adding habit:", error);
  }
};

// Load all habits from the database
export const loadHabits = async (userId: number): Promise<Habit[]> => {
  try {
    // Try to get habits from local SQLite first
    const localHabits = await local_db.getAllAsync<Habit>(`SELECT * FROM habits WHERE user_id = ?`, [userId]);

    if (localHabits.length > 0) {
      return localHabits;
    }

    // If local database is empty, fetch from SQLiteCloud
    const cloudHabits = await cloudDb.sql`SELECT * FROM habits WHERE user_id = ${userId}`;
    return cloudHabits as Habit[];  // Type assertion here to tell TypeScript the result is of type Habit[]

  } catch (error) {
    console.error('Error loading habits:', error);
    return [];
  }
};

// Update an existing habit
export const updateHabit = (id: number, newName: string): Promise<void> => {
  return local_db.execAsync(`UPDATE habits SET name = '${newName}' WHERE id = ${id};`)
    .catch(error => console.error('Error updating habit:', error));
};


// Delete a habit by its ID
export const deleteHabit = async (id: number, callback: () => void) => {
  try {
    // Delete from local SQLite
    await local_db.execAsync(`DELETE FROM habits WHERE id = ${id};`);

    // Delete from SQLiteCloud
    await cloudDb.sql`DELETE FROM habits WHERE id = ${id}`;

    callback();
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
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
export const getDb = () => local_db;
