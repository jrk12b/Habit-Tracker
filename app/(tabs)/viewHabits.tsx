import React, { useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '../screenWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native';
import { deleteAllHabitEntries, getDb } from '../database';
import { Habit, HabitEntry } from '../types';
import styles from '../styles/app';

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
  
      if (!Array.isArray(habitsData) || habitsData.length === 0) {
        setPreviousHabits([]);
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
  
      const habitsForView: HabitEntry[] = Object.keys(habitsGroupedByDate).map((date) => ({
        date,
        habits: habitsGroupedByDate[date],
      }));
  
      setPreviousHabits(habitsForView);
    } catch (error) {
      console.error('Failed to load previous habits:', error);
    }
  };
  

  useFocusEffect(
    useCallback(() => {
      loadPreviousHabits();
    }, [])
  );

    const [selectedMonth, setSelectedMonth] = useState<number>(-1);
    const filteredHabits =
    selectedMonth === -1
      ? previousHabits
      : previousHabits.filter((entry) => {
          const habitDate = new Date(entry.date);
          return habitDate.getMonth() === selectedMonth;
        });

  return (
    <ScreenWrapper>
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.date}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
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
      </ScreenWrapper>
  );
};

export default ViewHabitsScreen;
