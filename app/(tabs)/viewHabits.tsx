import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

type HabitEntry = {
  date: string;
  habits: Habit[];
};

const ViewHabitsScreen = () => {
  const [previousHabits, setPreviousHabits] = useState<HabitEntry[]>([]);

  const deleteTestData = async () => {
    try {
      await AsyncStorage.removeItem('previousHabits'); // Clear stored habits
      setPreviousHabits([]); // Update state to reflect deletion
      console.log('Test data deleted');
    } catch (error) {
      console.error('Failed to delete test data:', error);
    }
  };

  const addTestData = async () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });    
  
    // Create specific test dates
    const januaryDate = new Date(today.getFullYear(), 0, 15); // January 15
    const februaryDate = new Date(today.getFullYear(), 1, 20); // February 20
    const marchDate = new Date(today.getFullYear(), 2, 20); // February 20
  
    const formatTestDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  
    const testData = [
      {
        date: formatTestDate(januaryDate),
        habits: [
          { id: '4', name: 'Meditate', completed: false },
          { id: '5', name: 'Write journal', completed: true },
        ],
      },
      {
        date: formatTestDate(februaryDate),
        habits: [
          { id: '4', name: 'Meditate', completed: false },
          { id: '5', name: 'Write journal', completed: true },
        ],
      },
      {
        date: formatTestDate(marchDate),
        habits: [
          { id: '6', name: 'Go for a walk', completed: true },
          { id: '7', name: 'Cook healthy meal', completed: false },
        ],
      },
    ];
  
    try {
      const existingData = await AsyncStorage.getItem('previousHabits');
      const parsedData: HabitEntry[] = existingData ? JSON.parse(existingData) : [];
  
      const updatedData = [...parsedData, ...testData]; // Append new data
      await AsyncStorage.setItem('previousHabits', JSON.stringify(updatedData));
  
      setPreviousHabits(updatedData);
      console.log('Test data added');
    } catch (error) {
      console.error('Failed to add test data:', error);
    }
  };
  
  

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>
          My Habits View
        </ThemedText>
        <Button title="Add Test Data" onPress={addTestData} />
        <Button title="Delete Test Data" onPress={deleteTestData} color="red" />
      </View>
      <FlatList
        data={previousHabits}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.dateContainer}>
            {/* Display Date Header */}
            <ThemedText type="subtitle" style={styles.dateText}>
              {item.date}
            </ThemedText>
            
            {/* Render Habits for This Date */}
            {item.habits?.map((habit) => (
              <View key={habit.id} style={styles.habitRow}>
                <ThemedText type="default">{habit.name}</ThemedText>
                <ThemedText type="default" style={styles.status}>
                  {habit.completed ? '✅' : '❌'}
                </ThemedText>
              </View>
            ))}
    </View>
  )}
/>

    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  status: {
    fontSize: 18,
    color: '#4CAF50', // Green for checkmarks
  },
});


export default ViewHabitsScreen;
