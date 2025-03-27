import React, { useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '../screenWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { deleteAllHabitEntries, getDb } from '../database';
import { Habit, HabitEntry } from '../types';
import useStyles from '../styles/app';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '../auth';

const ViewHabitsScreen = () => {
  const [previousHabits, setPreviousHabits] = useState<HabitEntry[]>([]);  // State to store the list of habits
  const styles = useStyles();
  const navigation = useNavigation();


  const getAuthenticatedUserId = async (): Promise<number | null> => {
    try {
      const user = await getCurrentUser();
      return user?.id ? parseInt(user.id, 10) : null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  // Function to handle deleting all habit entries
  const handleDeleteAllHabits = async () => {
    await deleteAllHabitEntries();  // Call function to delete all entries from the database
    setPreviousHabits([]);  // Clear the state after deletion
  };

  // Load habit data from the database
  const loadPreviousHabits = async () => {
    const db = getDb();
    try {
      const habitsData = await db.getAllAsync<{ date: string; id: number; name: string; completed: number }>(
        `SELECT he.date, h.id, h.name, he.completed
         FROM habit_entries he
         JOIN habits h ON he.habit_id = h.id
         ORDER BY he.date DESC`
      );
  
      if (!Array.isArray(habitsData) || habitsData.length === 0) {
        setPreviousHabits([]);  // Set empty list if no data
        return;
      }
  
      // Group habits by date
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
  
      // Transform grouped habits into an array for rendering
      const habitsForView: HabitEntry[] = Object.keys(habitsGroupedByDate).map((date) => ({
        date,
        habits: habitsGroupedByDate[date],
      }));
  
      setPreviousHabits(habitsForView);  // Set the habits data to the state
    } catch (error) {
      console.error('Failed to load previous habits:', error);
    }
  };

  // useFocusEffect hook to load data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkAuthenticationAndLoadHabits = async () => {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
          console.log('No user ID found. Redirecting to login...');
          navigation.navigate('index'); // Redirect to login
          return;
        }

        await loadPreviousHabits(); // Load habits only if the user is authenticated
      };

      checkAuthenticationAndLoadHabits();
    }, [navigation])
  );

  // State to store the selected month from the Picker
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  
  // Filter the habits based on the selected month
  const filteredHabits =
    selectedMonth === -1
      ? previousHabits  // If no month is selected, show all habits
      : previousHabits.filter((entry) => {
          const habitDate = new Date(entry.date);
          return habitDate.getMonth() === selectedMonth;  // Only include habits for the selected month
        });

  return (
    <ScreenWrapper>
      <FlatList
        data={filteredHabits}  // Use filtered habits for rendering
        keyExtractor={(item) => item.date}  // Unique key for each entry based on date
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <ThemedText type="title">My Habits View</ThemedText>
            {/* Month Picker */}
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}  // Update selected month on change
              style={styles.picker}
            >
              <Picker.Item label="All Months" value={-1} />
              {/* Dynamically generate month options */}
              {Array.from({ length: 12 }, (_, index) => (
                <Picker.Item
                  key={index}
                  label={new Date(2025, index).toLocaleString('en', { month: 'long' })}
                  value={index}
                />
              ))}
            </Picker>
            {/* Button to delete all habit entries */}
            <Button title="Delete All Data" onPress={handleDeleteAllHabits} color="red" />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.dateContainer}>
            <ThemedText type="subtitle" style={styles.dateText}>
              {item.date}  {/* Display the date */}
            </ThemedText>
  
            {/* Render each habit for this date */}
            {item.habits?.map((habit) => (
              <View key={`${item.date}-${habit.id}`} style={styles.habitRow}>
                <ThemedText type="default">{habit.name}</ThemedText>
                {/* Display status of the habit */}
                <ThemedText type="default" style={styles.status}>
                  {habit.completed ? '✅' : '❌'}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      />
    </ScreenWrapper>
  );
};

export default ViewHabitsScreen;