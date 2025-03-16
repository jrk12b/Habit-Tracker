import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, FlatList, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { loadHabits, addHabit, deleteHabit, updateHabit, initDatabase, getDb } from '../database';

type Habit = {
  id: number;
  name: string;
};

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedHabit, setEditedHabit] = useState('');

  useEffect(() => {
    // Initialize the database to ensure the table exists
    initDatabase();

    // Load habits when the app starts
    const loadHabitData = async () => {
      try {
        const habitsFromDb = await loadHabits();  // Load from DB
        setHabits(habitsFromDb);
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };

    loadHabitData();
  }, []);

  // Add new habit
  const handleAddHabit = () => {
    if (newHabit.trim() !== '') {
      addHabit(newHabit, (id) => {
        const newHabitObj: Habit = { id: id!, name: newHabit };  // Ensure the id is provided
        setHabits(prev => [...prev, newHabitObj]);
      });
      setNewHabit('');
    }
  };

  // Start editing a habit
  const handleStartEditing = (id: number) => {
    setEditingId(id);
    const habitToEdit = habits.find(habit => habit.id === id);
    if (habitToEdit) {
      setEditedHabit(habitToEdit.name);
    }
  };

  // Save the edited habit
  const handleSaveEdit = () => {
    if (editedHabit.trim() !== '' && editingId !== null) {
      updateHabit(editingId, editedHabit); // Remove the callback here
      setHabits(prev =>
        prev.map(habit =>
          habit.id === editingId ? { ...habit, name: editedHabit } : habit
        )
      );
      setEditingId(null);
      setEditedHabit('');
    }
  };
  

  // Delete a habit
  const handleDeleteHabit = (id: number) => {
    deleteHabit(id, () => {
      setHabits(prev => prev.filter(habit => habit.id !== id));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
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
              <Button title="Add Habit" onPress={handleAddHabit} />
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
                <Button title="Save" onPress={handleSaveEdit} />
              </>
            ) : (
              <>
                <ThemedText>{item.name}</ThemedText>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleStartEditing(item.id)}>
                    <ThemedText style={styles.editButton}>✏️</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteHabit(item.id)}>
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
    paddingTop: 20,
  },
  flatListContent: {
    paddingHorizontal: 30,
    paddingBottom: 16,
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
});
