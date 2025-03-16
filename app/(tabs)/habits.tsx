import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View, TextInput, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '../screenWrapper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { loadHabits, updateHabit, getDb } from '../database';
import { Habit } from '../types';
import styles from '../styles/app';

const habitsScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useFocusEffect(
    React.useCallback(() => {
      const loadHabitData = async () => {
        try {
          const habitsFromDb = await loadHabits();
          setHabits(habitsFromDb);
        } catch (error) {
          console.error('Failed to load habits:', error);
        }
      };

      loadHabitData();
      setCurrentDate(getCurrentDate());
    }, [])
  );

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
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
        await updateHabit(habitToUpdate.id, habitToUpdate.name);
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };
  
  const startEditing = (id: number, name: string) => {
    setEditingHabitId(id);
    setEditedHabitName(name);
  };

  const saveEditedHabit = async () => {
    if (!editingHabitId) return;
  
    const updatedHabits = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedHabitName } : habit
    );
    setHabits(updatedHabits);
  
    // Update habit in the database
    await updateHabit(editingHabitId, editedHabitName);
  
    setEditingHabitId(null);
    setEditedHabitName('');
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
    <ScreenWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }} 
          ListHeaderComponent={
            <View style={styles.headerContainer}>
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
    </ScreenWrapper>
  );
}

export default habitsScreen;