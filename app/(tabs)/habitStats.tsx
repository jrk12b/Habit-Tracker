import React, { useState, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { HabitStats } from '../types';
import { getDb } from '../database';
import useStyles from '../styles/app';
import ScreenWrapper from '../screenWrapper';

const habitStatsScreen = () => {
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const styles = useStyles();

  const loadHabitStats = async () => {
    try {
      const db = getDb();
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
  
      const query = `
        SELECT h.name, he.completed, he.date
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.date >= ?
      `;
  
      const result: { name: string; completed: boolean; date: string }[] = await db.getAllAsync(query, [startOfYear.toISOString().split('T')[0]]);

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

  useFocusEffect(
    useCallback(() => {
      loadHabitStats();
    }, [selectedMonth])
  );

  return (
    <ScreenWrapper>
        {/* Habit Stats Table */}
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <ThemedText type="title">My Habit Stats</ThemedText>
          </View>
          {/* Month Picker */}
          <View>
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
          <FlatList
            data={habitStats}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={
              <View style={styles.tableHeader}>
                <ThemedText type="defaultSemiBold" style={styles.columnHeader}>Habit</ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.columnHeader, { textAlign: 'right' }]}>
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
                  <ThemedText type="default" style={styles.habitName}>{item.name}</ThemedText>
                  <ThemedText type="default" style={styles.completionRate}>{item.completionRate}%</ThemedText>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </View>
      </ScreenWrapper>
  );
};

export default habitStatsScreen;