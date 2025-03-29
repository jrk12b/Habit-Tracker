import React, { useState, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { HabitStats, TabsParamList } from '../types';
import { getDb } from '../database';
import useStyles from '../styles/app';
import ScreenWrapper from '../screenWrapper';
import { useNavigation } from '@react-navigation/native';
import { getAuthenticatedUserId } from '../auth';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const habitStatsScreen = () => {
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const styles = useStyles();
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList>>();

  // Load habit stats from the database
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

      // Filter entries based on selected month
      const filteredEntries = result.filter((entry) => {
        const habitDate = new Date(entry.date);
        return selectedMonth === -1 || habitDate.getMonth() === selectedMonth;
      });

      // Calculate habit completion stats
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

      // Create stats object with completion rate
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

  // UseFocusEffect to reload data when the screen is focused or month filter changes
  useFocusEffect(
    useCallback(() => {
      const checkAuthenticationAndLoadStats = async () => {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
          console.log('No user ID found. Redirecting to login...');
          navigation.navigate('index'); // Redirect to login
          return;
        }

        await loadHabitStats(); // Load stats only if the user is authenticated
      };

      checkAuthenticationAndLoadStats();
    }, [selectedMonth, navigation]) // Dependency on selectedMonth to reload data when it changes
  );

  return (
    <ScreenWrapper>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ThemedText type="title">My Habit Stats</ThemedText>
        </View>

        {/* Month Picker */}
        <View>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}  // Update selected month on change
            style={styles.picker}
          >
            <Picker.Item label="All Months" value={-1} />
            {/* Dynamically generate month picker items */}
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
              <ThemedText type="defaultSemiBold" style={[styles.columnHeader, { textAlign: 'right' }]}>
                Completion %
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => {
            // Determine the background color based on completion rate
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
          contentContainerStyle={{ paddingBottom: 50 }}  // Add padding for footer
        />
      </View>
    </ScreenWrapper>
  );
};

export default habitStatsScreen;