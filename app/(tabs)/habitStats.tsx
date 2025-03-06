import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Picker } from '@react-native-picker/picker';

type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

type HabitEntry = {
  date: string;
  habits: Habit[];
};

type HabitStats = {
  name: string;
  completionRate: number;
};

const HabitStatsScreen = () => {
  const [previousHabits, setPreviousHabits] = useState<HabitEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 represents "All Months"
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);

  // Load habits from AsyncStorage
  const loadPreviousHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('previousHabits');
      if (storedHabits) {
        const parsedHabits: HabitEntry[] = JSON.parse(storedHabits);
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

  // Calculate completion percentage per habit
  useEffect(() => {
    const filteredHabits =
      selectedMonth === -1
        ? previousHabits // Show all months
        : previousHabits.filter((entry) => {
            const habitDate = new Date(entry.date);
            return habitDate.getMonth() === selectedMonth;
          });

    const habitCountMap: Record<string, { total: number; completed: number }> = {};

    filteredHabits.forEach((entry) => {
      entry.habits.forEach((habit) => {
        if (!habitCountMap[habit.name]) {
          habitCountMap[habit.name] = { total: 0, completed: 0 };
        }
        habitCountMap[habit.name].total += 1;
        if (habit.completed) {
          habitCountMap[habit.name].completed += 1;
        }
      });
    });

    const stats = Object.keys(habitCountMap).map((name) => ({
      name,
      completionRate: habitCountMap[name].total
        ? Math.round((habitCountMap[name].completed / habitCountMap[name].total) * 100)
        : 0,
    }));

    setHabitStats(stats);
  }, [selectedMonth, previousHabits]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <IconSymbol
          size={80}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
        <ThemedText type="title">My Habit Stats</ThemedText>
      </View>

      {/* Month Picker */}
      <View style={styles.pickerContainer}>
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
      </View>

      {/* Habit Stats Table */}
      <FlatList
        data={habitStats}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <ThemedText type="defaultSemiBold" style={styles.columnHeader}>Habit</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.columnHeader}>Completion %</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ThemedText type="default">{item.name}</ThemedText>
            <ThemedText type="default">{item.completionRate}%</ThemedText>
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
    paddingTop: 50
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerImage: {
    marginBottom: 10,
  },
  pickerContainer: {
    marginVertical: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    marginTop: -70,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default HabitStatsScreen;
