import React, { useState, useEffect } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Picker } from '@react-native-picker/picker';
import { Platform } from 'react-native';

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

  // const deleteTestData = async () => {
  //   try {
  //     await AsyncStorage.removeItem('previousHabits'); // Clear stored habits
  //     setPreviousHabits([]); // Update state to reflect deletion
  //     console.log('Test data deleted');
  //   } catch (error) {
  //     console.error('Failed to delete test data:', error);
  //   }
  // };

  // const addTestData = async () => {
  //   const today = new Date();
  //   const formattedDate = today.toLocaleDateString('en-US', {
  //     weekday: 'long',
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   });    
    
  //   // Create specific test dates
  //   const januaryDate = new Date(today.getFullYear(), 0, 15); // January 15
  //   const februaryDate = new Date(today.getFullYear(), 1, 20); // February 20
  //   const marchDate = new Date(today.getFullYear(), 2, 20); // February 20
  
  //   const formatTestDate = (date: Date) =>
  //     date.toLocaleDateString('en-US', {
  //       weekday: 'long',
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric',
  //     });
  
  //   const testData = [
  //     {
  //       date: formatTestDate(januaryDate),
  //       habits: [
  //         { id: '4', name: 'Meditate', completed: false },
  //         { id: '5', name: 'Write journal', completed: true },
  //       ],
  //     },
  //     {
  //       date: formatTestDate(februaryDate),
  //       habits: [
  //         { id: '4', name: 'Meditate', completed: false },
  //         { id: '5', name: 'Write journal', completed: true },
  //       ],
  //     },
  //     {
  //       date: formatTestDate(marchDate),
  //       habits: [
  //         { id: '6', name: 'Go for a walk', completed: true },
  //         { id: '7', name: 'Cook healthy meal', completed: false },
  //       ],
  //     },
  //   ];
  
  //   try {
  //     const existingData = await AsyncStorage.getItem('previousHabits');
  //     const parsedData: HabitEntry[] = existingData ? JSON.parse(existingData) : [];
  
  //     const updatedData = [...parsedData, ...testData]; // Append new data
  //     await AsyncStorage.setItem('previousHabits', JSON.stringify(updatedData));
  
  //     setPreviousHabits(updatedData);
  //     console.log('Test data added');
  //   } catch (error) {
  //     console.error('Failed to add test data:', error);
  //   }
  // };

  useEffect(() => {
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
  
    loadPreviousHabits();
  }, []);

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
        {/* Buttons for adding/deleting test data */}
        {/* <View style={styles.buttonsContainer}>
          <Button title="Add Test Data" onPress={addTestData} />
          <Button title="Delete Test Data" onPress={deleteTestData} color="red" />
        </View> */}
      </View>
        {/* Picker for selecting month */}
        {/* <View style={styles.filterWrapper}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
            mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
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
        </View> */}
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
    justifyContent: 'flex-start',  // Ensure components are stacked correctly
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,  // Reduced marginBottom to minimize space
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10, // Adjust margin for spacing
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonsContainer: {
    marginTop: 10,  // Reduced marginTop to reduce space
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  listContainer: {
    flex: 1,  // Allow FlatList to take up remaining space
  },
});



export default ViewHabitsScreen;
