import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native';

// Define the Habit interface
interface Habit {
  id: string;
  name: string;
  completed: boolean;
  date: string;
}

interface HabitEntry {
  date: string;
  habits: Habit[];
}

export default function TabTwoScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Load habits from AsyncStorage on component mount and whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadHabits = async () => {
        try {
          const storedHabits = await AsyncStorage.getItem('habits');
          if (storedHabits) {
            const parsedHabits = JSON.parse(storedHabits);
            setHabits(parsedHabits);
          }
        } catch (error) {
          console.error('Failed to load habits:', error);
        }
      };

      loadHabits();
      setCurrentDate(getCurrentDate());

    }, []) // This will run whenever the screen comes into focus
  );

  // Get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0'); // Padding day to ensure 2 digits
  
    return `${year}-${month}-${day}`; // Returns date in the format YYYY-MM-DD
  };
  

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  };
  
  
  const startEditing = (id: string, name: string) => {
    setEditingHabitId(id);
    setEditedHabitName(name);
  };

  const saveEditedHabit = () => {
    if (!editingHabitId) return;

    const updatedHabits = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedHabitName } : habit
    );
    setHabits(updatedHabits);
    saveHabits(updatedHabits); // Save updated habits to AsyncStorage

    setEditingHabitId(null);
    setEditedHabitName('');
  };

  // Save habits to AsyncStorage
// Save habits to AsyncStorage
const saveHabits = async (habits: Habit[]) => {
  const todayDate = getCurrentDate();
  try {
    const storedHabits = await AsyncStorage.getItem('previousHabits');
    const parsedHabits: HabitEntry[] = storedHabits ? JSON.parse(storedHabits) : [];

    // Add current habits to previousHabits without resetting the completion status
    const newHabitEntry: HabitEntry = {
      date: todayDate,
      habits: habits, // Don't modify the completion status here
    };

    const updatedHabits = [...parsedHabits, newHabitEntry];
    await AsyncStorage.setItem('previousHabits', JSON.stringify(updatedHabits));

    // Reset completion status of the current habits to not done
    const resetHabits = habits.map(habit => ({ ...habit, completed: false }));
    setHabits(resetHabits); // Update the local state with the reset habits

    await AsyncStorage.setItem('habits', JSON.stringify(resetHabits)); // Persist the reset completion status

    console.log('Habits saved and reset!');
  } catch (error) {
    console.error('Failed to save habits:', error);
  }
};

  
  
  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }} 
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <IconSymbol
                size={80}
                color="#808080"
                name="chevron.left.forwardslash.chevron.right"
                style={styles.headerImage}
              />
              <ThemedText type="title">Daily Habits</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.dateText}>{currentDate}</ThemedText>
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: 16 }}>
              <Button title="Submit Habits" onPress={() => saveHabits(habits)} />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitItem}>
              {editingHabitId === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editedHabitName}
                  onChangeText={setEditedHabitName}
                  autoFocus
                  onBlur={saveEditedHabit}
                  onSubmitEditing={saveEditedHabit}
                />
              ) : (
                <TouchableOpacity onPress={() => startEditing(item.id, item.name)}>
                  <ThemedText type="default">{item.name}</ThemedText>
                </TouchableOpacity>
              )}
              <ThemedText type="defaultSemiBold">{item.completed ? '✅' : '❌'}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </GestureHandlerRootView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerImage: {
    marginBottom: 10,
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#808080',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    width: 200,
  },
});
