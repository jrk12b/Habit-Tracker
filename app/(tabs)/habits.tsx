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
  date: string;
}

export default function TabTwoScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
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
          const parsedHabits = JSON.parse(storedHabits);
          setHabits(parsedHabits);
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
      await savePreviousDayHabits(); // Save yesterday's state
      resetHabits(); // Reset completion status
  
      await AsyncStorage.setItem('lastCheckedDate', todayDate);
    }
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
  const resetHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      if (storedHabits) {
        const parsedHabits: Habit[] = JSON.parse(storedHabits); // Explicitly define type
        const resetHabits = parsedHabits.map((habit: Habit) => ({
          ...habit,
          completed: false, // Reset completion status
        }));
  
        setHabits(resetHabits);
        await AsyncStorage.setItem('habits', JSON.stringify(resetHabits)); // Save reset habits
      }
    } catch (error) {
      console.error('Failed to reset habits:', error);
    }
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

