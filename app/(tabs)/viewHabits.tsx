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

  // Load habits from AsyncStorage
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

  // Add test data
  const addTestHabitData = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('previousHabits');
      const parsedHabits: HabitEntry[] = storedHabits ? JSON.parse(storedHabits) : [];
  
      const testData: HabitEntry[] = [
        {
          date: '2025-01-15', // Store as raw date string
          habits: [
            { id: '1', name: 'Workout', completed: true },
            { id: '2', name: 'Read a book', completed: false },
          ],
        },
        {
          date: '2025-02-10',
          habits: [
            { id: '3', name: 'Meditation', completed: true },
            { id: '4', name: 'Drink water', completed: true },
          ],
        },
      ];      
  
      const updatedHabits = [...parsedHabits, ...testData];
      await AsyncStorage.setItem('previousHabits', JSON.stringify(updatedHabits));
  
      console.log('Test habit data added!');
      loadPreviousHabits(); // Refresh list after adding test data
    } catch (error) {
      console.error('Failed to add test habit data:', error);
    }
  };

  // Clear previous data
  const clearPreviousData = async () => {
    try {
      await AsyncStorage.removeItem('previousHabits');
      setPreviousHabits([]);
      console.log('Previous habit data cleared');
    } catch (error) {
      console.error('Failed to clear previous habit data:', error);
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
                keyExtractor={(item, index) => index.toString()}
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
                    <Button title="Add Test Data" onPress={addTestHabitData} color="blue" />
                  <Button title="Clear Previous Data" onPress={clearPreviousData} color="red" />
                  </View>
                }
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
