import React, { useState } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
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

const HabitStatsScreen = () => {
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
                  <ThemedText type="title">My Habit Stats</ThemedText>
                </View>
              }
              // ListFooterComponent={}
              renderItem={() => (
                <View></View>
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

export default HabitStatsScreen;
