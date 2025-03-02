import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

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


  useEffect(() => {
    const resetHabitsEveryDay = async () => {
      const today = new Date();
      const currentDay = today.getDate();
      
      // Check if it's a new day
      const lastSavedDate = await AsyncStorage.getItem('lastSavedDate');
      const lastDate = lastSavedDate ? new Date(lastSavedDate).getDate() : null;
  
      if (currentDay !== lastDate) {
        // Reset habits if it's a new day
        const updatedHabits = habits.map(habit => ({ ...habit, completed: false }));
        setHabits(updatedHabits);
        saveHabits(updatedHabits);
  
        // Save the current date to mark when habits were last saved
        await AsyncStorage.setItem('lastSavedDate', today.toString());
      }
    };
  
    resetHabitsEveryDay();
  
  }, [habits]); // Run every time habits are updated
  

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

  // Save habits to AsyncStorage
  const saveHabits = async (habits: Habit[]) => {
    const todayDate = getCurrentDate(); // You already have this function to get the current date
    try {
      // Get the stored habits for 'previousHabits'
      const storedHabits = await AsyncStorage.getItem('previousHabits');
      const parsedHabits: HabitEntry[] = storedHabits ? JSON.parse(storedHabits) : [];
  
      // Check if today's habits are already saved
      const isTodaySaved = parsedHabits.some(entry => entry.date === todayDate);
      
      if (!isTodaySaved) {
        // Save the habits only if today's entry does not exist
        const newHabitEntry: HabitEntry = {
          date: todayDate,
          habits: habits,
        };
  
        // Add new entry to the previous habits list
        const updatedHabits = [...parsedHabits, newHabitEntry];
  
        await AsyncStorage.setItem('previousHabits', JSON.stringify(updatedHabits)); // Save to AsyncStorage
      }
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
