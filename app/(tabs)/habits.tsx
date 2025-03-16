import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { loadHabits, addHabit, updateHabit, deleteHabit, getDb } from '../database';
import { Habit } from '../types';

export default function TabTwoScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Load habits from SQLite on component mount and whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadHabitData = async () => {
        try {
          const habitsFromDb = await loadHabits();  // Load habits from the database
          setHabits(habitsFromDb);
        } catch (error) {
          console.error('Failed to load habits:', error);
        }
      };

      loadHabitData();
      setCurrentDate(getCurrentDate());
    }, []) // This will run whenever the screen comes into focus
  );

  // Get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0'); // Padding day to ensure 2 digits
  
    return `${year}-${month}-${day}`; // Returns date in the format YYYY-MM-DD
  };

  // Toggle habit completion and update in SQLite
  const toggleHabit = async (id: number) => {
    try {
      const updatedHabits = habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      );
      setHabits(updatedHabits);
  
      // Update the habit completion status in the database
      const habitToUpdate = updatedHabits.find(habit => habit.id === id);
      if (habitToUpdate) {
        await updateHabit(habitToUpdate.id, habitToUpdate.name); // Now only 2 arguments
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };
  

  // Start editing a habit
  const startEditing = (id: number, name: string) => {
    setEditingHabitId(id);
    setEditedHabitName(name);
  };

  // Save edited habit to SQLite
  const saveEditedHabit = async () => {
    if (!editingHabitId) return;
  
    const updatedHabits = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedHabitName } : habit
    );
    setHabits(updatedHabits);
  
    // Update habit in the database
    await updateHabit(editingHabitId, editedHabitName); // Now only 2 arguments
  
    setEditingHabitId(null);
    setEditedHabitName('');
  };
  

  // Add a new habit and save it to SQLite
  const handleAddHabit = async () => {
    if (newHabit.trim() === '') return;

    // Add habit to SQLite
    addHabit(newHabit, (id) => {
      const newHabitObj = { id: id!, name: newHabit, completed: false };
      setHabits((prev) => [...prev, newHabitObj]);
    });

    setNewHabit('');
  };

  const handleSubmitHabits = async () => {
    try {
      const today = getCurrentDate();
      const db = getDb();
  
      // Check if habits have already been submitted today
      const existingEntries = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM habit_entries WHERE date = ?`,
        [today]
      );
  
      if (existingEntries[0]?.count > 0) {
        console.log('Habits already submitted for today. Submission blocked.');
        return;
      }
  
      // Iterate through the current habits and save them to the database for today
      await Promise.all(
        habits.map(async (habit) => {
          await db.execAsync(`
            INSERT INTO habit_entries (date, habit_id, completed) 
            VALUES ('${today}', ${habit.id}, ${habit.completed ? 1 : 0});
          `);
        })
      );
  
      console.log('Habits submitted for today!');
    } catch (error) {
      console.error('Failed to submit habits:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }} 
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <IconSymbol
                size={80}
                color="#808080"
                name="chevron.left.forwardslash.chevron.right"
                style={styles.headerImage}
              />
              <ThemedText type="title">Daily Habits</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.dateText}>{currentDate}</ThemedText>
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: 16 }}>
              <Button title="Submit Habits" onPress={handleSubmitHabits} />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitItem}>
              {editingHabitId === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editedHabitName}
                  onChangeText={setEditedHabitName}
                  autoFocus
                  onBlur={saveEditedHabit}
                  onSubmitEditing={saveEditedHabit}
                />
              ) : (
                <TouchableOpacity onPress={() => startEditing(item.id, item.name)}>
                  <ThemedText type="default">{item.name}</ThemedText>
                </TouchableOpacity>
              )}
              <ThemedText type="defaultSemiBold">{item.completed ? '✅' : '❌'}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </GestureHandlerRootView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerImage: {
    marginBottom: 10,
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#808080',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    width: 200,
  },
});
