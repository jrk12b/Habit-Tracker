import React, { useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native';
import { deleteAllHabitEntries, getDb } from '../database';


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

  const handleDeleteAllHabits = async () => {
    await deleteAllHabitEntries();
    setPreviousHabits([]);
  };

  const loadPreviousHabits = async () => {
    const db = getDb();
    try {
      const habitsData = await db.getAllAsync<{ date: string; id: number; name: string; completed: number }>(
        `SELECT he.date, h.id, h.name, he.completed
         FROM habit_entries he
         JOIN habits h ON he.habit_id = h.id
         ORDER BY he.date DESC`
      );
  
      // Check if habitsData is an array and if it has content
      if (!Array.isArray(habitsData) || habitsData.length === 0) {
        setPreviousHabits([]);  // Set an empty array if no data is found
        return;
      }
  
      const habitsGroupedByDate: { [key: string]: Habit[] } = {};
      
      habitsData.forEach((entry: any) => {
        const habitEntry: Habit = {
          id: entry.id,
          name: entry.name,
          completed: entry.completed === 1,
        };
        if (!habitsGroupedByDate[entry.date]) {
          habitsGroupedByDate[entry.date] = [];
        }
        habitsGroupedByDate[entry.date].push(habitEntry);
      });
  
      // Convert grouped habits into an array of HabitEntry objects
      const habitsForView: HabitEntry[] = Object.keys(habitsGroupedByDate).map((date) => ({
        date,
        habits: habitsGroupedByDate[date],
      }));
  
      setPreviousHabits(habitsForView);
    } catch (error) {
      console.error('Failed to load previous habits:', error);
    }
  };
  

  // Reload habits every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPreviousHabits();
    }, [])
  );

  // Filter habits based on selected month
    const [selectedMonth, setSelectedMonth] = useState<number>(-1);
    const filteredHabits =
    selectedMonth === -1
      ? previousHabits // Show all months
      : previousHabits.filter((entry) => {
          const habitDate = new Date(entry.date); // Ensure this parses correctly
          return habitDate.getMonth() === selectedMonth;
        });

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <ThemedView style={styles.container}>
              <FlatList
                data={filteredHabits}
                keyExtractor={(item) => item.date}
                ListHeaderComponent={
                  <View style={styles.headerContainer}>
                    <IconSymbol
                      size={80}
                      color="#808080"
                      name="chevron.left.forwardslash.chevron.right"
                      style={styles.headerImage}
                    />
                    <ThemedText type="title">My Habits View</ThemedText>
                    <Picker
                      selectedValue={selectedMonth}
                      onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Months" value={-1} />
                      {Array.from({ length: 12 }, (_, index) => (
                        <Picker.Item
                          key={index}
                          label={new Date(2025, index).toLocaleString('en', { month: 'long' })}
                          value={index}
                        />
                      ))}
                    </Picker>
                    <Button title="Delete All Data" onPress={handleDeleteAllHabits} color="red" />
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.dateContainer}>
                    <ThemedText type="subtitle" style={styles.dateText}>
                      {item.date}
                    </ThemedText>
        
                    {item.habits?.map((habit) => (
                      <View key={`${item.date}-${habit.id}`} style={styles.habitRow}>
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
          </SafeAreaView>
        );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  
  pickerContainer: {
    width: '50%',
  },
  picker: {
    width: '100%',
    marginTop: -50,
  },
  
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  
  buttonSpacing: {
    height: 10,
  },
    headerImage: {
    marginBottom: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    justifyContent: 'flex-start',
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
