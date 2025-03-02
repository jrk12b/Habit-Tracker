import { useState, useEffect } from 'react';
import { Image, StyleSheet, TextInput, Button, FlatList, View, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import uuid from 'react-native-uuid';

type Habit = {
  id: string;
  name: string;
};

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedHabit, setEditedHabit] = useState('');

  // Load habits when the app starts
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem('habits');
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };

    loadHabits();
  }, []);

  // Save habits to AsyncStorage
  const saveHabits = async (updatedHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Failed to save habits:', error);
    }
  };

  // Add new habit
  const addHabit = () => {
    if (newHabit.trim() !== '') {
      const newHabitObj: Habit = { id: uuid.v4() as string, name: newHabit };
      const updatedHabits = [...habits, newHabitObj];
      saveHabits(updatedHabits);
      setNewHabit('');
    }
  };

  // Start editing a habit
  const startEditing = (id: string) => {
    setEditingId(id);
    const habitToEdit = habits.find(habit => habit.id === id);
    if (habitToEdit) {
      setEditedHabit(habitToEdit.name);
    }
  };

  // Save the edited habit
  const saveEdit = () => {
    if (editedHabit.trim() !== '' && editingId !== null) {
      const updatedHabits = habits.map(habit =>
        habit.id === editingId ? { ...habit, name: editedHabit } : habit
      );
      saveHabits(updatedHabits);
      setEditingId(null);
      setEditedHabit('');
    }
  };

  // Delete a habit
  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    saveHabits(updatedHabits);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Set Your Daily Habits</ThemedText>
            </ThemedView>

            {/* Input for adding a new habit */}
            <ThemedView style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter new habit..."
                value={newHabit}
                onChangeText={setNewHabit}
              />
              <Button title="Add Habit" onPress={addHabit} />
            </ThemedView>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedHabit}
                  onChangeText={setEditedHabit}
                />
                <Button title="Save" onPress={saveEdit} />
              </>
            ) : (
              <>
                <ThemedText>{item.name}</ThemedText>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => startEditing(item.id)}>
                    <ThemedText style={styles.editButton}>✏️</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteHabit(item.id)}>
                    <ThemedText style={styles.deleteButton}>🗑️</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.flatListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20, // Ensure space at the top for the header
  },
  flatListContent: {
    paddingHorizontal: 30, // Add horizontal padding to the list
    paddingBottom: 16, // Add bottom padding to avoid content touching the bottom
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    color: '#007AFF',
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontSize: 18,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
