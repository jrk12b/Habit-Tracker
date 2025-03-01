import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// Define the Habit interface
interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

export default function TabTwoScreen() {
  const [habits, setHabits] = useState<Habit[]>([]); // Habits state is now typed
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [lastCheckedDate, setLastCheckedDate] = useState<string | null>(null);

  // Load habits from AsyncStorage on component mount
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem('habits');
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits)); // If habits exist in storage, load them
        }
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };

    loadHabits();
    setCurrentDate(getCurrentDate());
    checkForNewDay();
  }, []);

  // Get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    const dayOfWeek = daysOfWeek[today.getDay()];

    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  // Check if the date has changed (indicating a new day)
  const checkForNewDay = async () => {
    const storedDate = await AsyncStorage.getItem('lastCheckedDate');
    const todayDate = getCurrentDate();

    if (storedDate !== todayDate) {
      // Save the previous day's habits to AsyncStorage
      await savePreviousDayHabits();
      // Reset the habits for the new day
      resetHabits();
      // Update the date in AsyncStorage
      await AsyncStorage.setItem('lastCheckedDate', todayDate);
    }

    setLastCheckedDate(storedDate);
  };

  // Save previous day's habits
  const savePreviousDayHabits = async () => {
    try {
      await AsyncStorage.setItem('previousHabits', JSON.stringify(habits));
    } catch (error) {
      console.error('Failed to save previous habits:', error);
    }
  };

  // Reset habits to the default state for a new day
  const resetHabits = () => {
    const resetHabits = habits.map((habit) => ({
      ...habit,
      completed: false, // Reset all habits to incomplete
    }));
    setHabits(resetHabits);
    saveHabits(resetHabits); // Save the reset habits to AsyncStorage
  };

  // Save habits to AsyncStorage
  const saveHabits = async (habits: Habit[]) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(habits)); // Save habits to AsyncStorage
    } catch (error) {
      console.error('Failed to save habits:', error);
    }
  };

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    saveHabits(updatedHabits); // Save updated habits to AsyncStorage
  };

  const addHabit = () => {
    if (newHabit.trim() === '') return;
    const newHabitItem = { id: Date.now().toString(), name: newHabit, completed: false };
    const updatedHabits = [...habits, newHabitItem];
    setHabits(updatedHabits);
    saveHabits(updatedHabits); // Save updated habits to AsyncStorage
    setNewHabit('');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
    saveHabits(updatedHabits); // Save updated habits to AsyncStorage
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

  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <IconSymbol
                size={80}
                color="#808080"
                name="chevron.left.forwardslash.chevron.right"
                style={styles.headerImage}
              />
              <ThemedText type="title">Daily Habits</ThemedText>
              
              {/* Display current date */}
              <ThemedText type="defaultSemiBold" style={styles.dateText}>{currentDate}</ThemedText>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter a new habit"
                  value={newHabit}
                  onChangeText={setNewHabit}
                />
                <Button title="Add" onPress={addHabit} />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity onPress={() => deleteHabit(item.id)} style={styles.deleteButtonSwipe}>
                  <ThemedText type="defaultSemiBold">Delete</ThemedText>
                </TouchableOpacity>
              )}
            >
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
            </Swipeable>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
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
  deleteButtonSwipe: {
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 100,
    borderRadius: 8,
  },
});

