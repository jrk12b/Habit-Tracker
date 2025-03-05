import React, { useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
    const filteredHabits =
    selectedMonth === null
      ? previousHabits
      : previousHabits.filter((entry) => {
          const habitDate = new Date(entry.date); // Ensure this parses correctly
          return habitDate.getMonth() === selectedMonth;
        });

        return (
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
                </View>
              }
              ListFooterComponent={
                <View style={styles.buttonContainer}>
                  <Button title="Add Test Data" onPress={addTestHabitData} color="blue" />
                  <View /> 
                <Button title="Clear Previous Data" onPress={clearPreviousData} color="red" />
                <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedMonth}
                      onValueChange={(value) => setSelectedMonth(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Months" value={null} />
                      <Picker.Item label="January" value={0} />
                      <Picker.Item label="February" value={1} />
                      <Picker.Item label="March" value={2} />
                      <Picker.Item label="April" value={3} />
                      <Picker.Item label="May" value={4} />
                      <Picker.Item label="June" value={5} />
                      <Picker.Item label="July" value={6} />
                      <Picker.Item label="August" value={7} />
                      <Picker.Item label="September" value={8} />
                      <Picker.Item label="October" value={9} />
                      <Picker.Item label="November" value={10} />
                      <Picker.Item label="December" value={11} />
                    </Picker>
                  </View>
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
        );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  
  pickerContainer: {
    width: '50%',  // Adjusted width to avoid stretching
  },
  picker: {
    width: '100%',
  },
  
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    // marginTop: 10, // Ensures buttons are below the picker
  },
  
  buttonSpacing: {
    height: 10, // Adds spacing between buttons
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
