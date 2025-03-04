import React, { useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

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
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Function to load habits
  const loadPreviousHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('previousHabits');
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        setPreviousHabits(parsedHabits);
      }
    } catch (error) {
      console.error('Failed to load previous habits:', error);
    }
  };

  // 🔹 Reload habits every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPreviousHabits();
    }, [])
  );

  const clearPreviousData = async () => {
    try {
      await AsyncStorage.removeItem('previousHabits'); // Clear the stored habits
      setPreviousHabits([]); // Clear the displayed data as well
      console.log('Previous habit data cleared');
    } catch (error) {
      console.error('Failed to clear previous habit data:', error);
    }
  };

  const filteredHabits = selectedMonth === null
    ? previousHabits
    : previousHabits.filter((entry) => {
        const habitDate = new Date(entry.date);
        return habitDate.getMonth() === selectedMonth;
      });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>
          My Habits View
        </ThemedText>
        <Button title="Clear Previous Data" onPress={clearPreviousData} color="red" />
      </View>
      <FlatList
        data={filteredHabits}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.dateContainer}>
            <ThemedText type="subtitle" style={styles.dateText}>
              {item.date}
            </ThemedText>
            
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
    justifyContent: 'flex-start',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
    color: '#4CAF50',
  },
});

export default ViewHabitsScreen;
