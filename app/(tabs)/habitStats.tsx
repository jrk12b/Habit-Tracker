import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native';
import { HabitStats } from '../types';
import { getDb } from '../database';  // Assuming you have a helper to get the DB

const HabitStatsScreen = () => {
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 represents "All Months"
  const colorScheme = useColorScheme();

  // Load habit stats from SQLite
  const loadHabitStats = async () => {
    try {
      const db = getDb();
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
  
      // Query all habit entries for this year (or specific month)
      const query = `
        SELECT h.name, he.completed, he.date
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.date >= ?
      `;
  
      // Explicitly type the result
      const result: { name: string; completed: boolean; date: string }[] = await db.getAllAsync(query, [startOfYear.toISOString().split('T')[0]]);
  
      // Filter habits based on selected month
      const filteredEntries = result.filter((entry) => {
        const habitDate = new Date(entry.date);
        return selectedMonth === -1 || habitDate.getMonth() === selectedMonth;
      });
  
      const habitCountMap: Record<string, { total: number; completed: number }> = {};
  
      filteredEntries.forEach((entry) => {
        if (!habitCountMap[entry.name]) {
          habitCountMap[entry.name] = { total: 0, completed: 0 };
        }
        habitCountMap[entry.name].total += 1;
        if (entry.completed) {
          habitCountMap[entry.name].completed += 1;
        }
      });
  
      const stats = Object.keys(habitCountMap).map((name) => ({
        name,
        completionRate: habitCountMap[name].total
          ? Math.round((habitCountMap[name].completed / habitCountMap[name].total) * 100)
          : 0,
      }));
  
      setHabitStats(stats);
    } catch (error) {
      console.error('Failed to load habit stats:', error);
    }
  };

  // Reload stats every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadHabitStats();
    }, [selectedMonth])
  );

  const styles = createStyles(colorScheme || 'light');
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View style={{ flex: 1 }}>
          <FlatList
            data={habitStats}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={
              <View style={styles.tableHeader}>
                <ThemedText type="defaultSemiBold" style={styles.columnHeader}>
                  Habit
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.columnHeader}>
                  Completion %
                </ThemedText>
              </View>
            }
            renderItem={({ item }) => {
              let backgroundColor;
              if (item.completionRate > 80) {
                backgroundColor = '#ccffcc'; // Light Green
              } else if (item.completionRate >= 50) {
                backgroundColor = '#ffffcc'; // Light Yellow
              } else {
                backgroundColor = '#ffcccc'; // Light Red
              }

              return (
                <View style={[styles.row, { backgroundColor }]}>
                  <ThemedText type="default" style={{ color: '#000' }}>{item.name}</ThemedText>
                  <ThemedText type="default" style={{ color: '#000' }}>{item.completionRate}%</ThemedText>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 50 }} // Prevents last item from getting cut off
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 50,
      backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 10,
    },
    headerImage: {
      marginBottom: 10,
    },
    headerText: {
      color: colorScheme === 'dark' ? '#fff' : '#000',
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
      borderBottomColor: colorScheme === 'dark' ? '#555' : '#ddd',
    },
    columnHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 10, // Add horizontal padding
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#555' : '#ddd',
      borderRadius: 5, // Slightly rounded corners
    },
  });
};

export default HabitStatsScreen;