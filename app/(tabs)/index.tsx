import { useState, useEffect } from 'react';
import { TextInput, Button, FlatList, View, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../screenWrapper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { loadHabits, addHabit, deleteHabit, updateHabit, initDatabase } from '../database';
import { Habit } from '../types';
import useStyles from '../styles/app';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]); // Track habits from DB
  const [newHabit, setNewHabit] = useState(''); // State for new habit input
  const [editingId, setEditingId] = useState<number | null>(null); // ID of habit being edited
  const [editedHabit, setEditedHabit] = useState(''); // Edited habit text
  const styles = useStyles(); // Get styles based on theme

  // Load habits from the database when component mounts
  useEffect(() => {
    initDatabase(); // Initialize the database (e.g., create tables)
    
    const loadHabitData = async () => {
      try {
        const habitsFromDb = await loadHabits(); // Fetch habits from DB
        setHabits(habitsFromDb); // Set habits into state
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };

    loadHabitData(); // Call async function to load habits
  }, []); // Empty dependency array means this runs only once when the component mounts

  // Add new habit to the database
  const handleAddHabit = () => {
    if (newHabit.trim() !== '') { // Avoid adding empty habits
      addHabit(newHabit, (id) => { // Add habit to DB and get the generated id
        const newHabitObj: Habit = { id: id!, name: newHabit, completed: false };
        setHabits(prev => [...prev, newHabitObj]); // Update habits in state
      });
      setNewHabit(''); // Clear the new habit input field
    }
  };

  // Start editing a habit
  const handleStartEditing = (id: number) => {
    setEditingId(id); // Set the ID of the habit being edited
    const habitToEdit = habits.find(habit => habit.id === id); // Find the habit to edit
    if (habitToEdit) {
      setEditedHabit(habitToEdit.name); // Set the habit name in the input field
    }
  };

  // Save the edited habit to the database
  const handleSaveEdit = () => {
    if (editedHabit.trim() !== '' && editingId !== null) { // Only save if input is not empty
      updateHabit(editingId, editedHabit); // Update habit in DB
      setHabits(prev =>
        prev.map(habit =>
          habit.id === editingId ? { ...habit, name: editedHabit } : habit
        )
      ); // Update habit in state
      setEditingId(null); // Reset editing state
      setEditedHabit(''); // Clear the edited habit text
    }
  };

  // Delete a habit from the database
  const handleDeleteHabit = (id: number) => {
    deleteHabit(id, () => {
      setHabits(prev => prev.filter(habit => habit.id !== id)); // Remove habit from state
    });
  };

  return (
    <ScreenWrapper>
      <FlatList
        data={habits} // Render the list of habits
        keyExtractor={(item) => item.id.toString()} // Use habit ID as the unique key
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
                placeholderTextColor={styles.inputPlaceholder.color} // Dynamic placeholder color
                value={newHabit} // Bind input value to state
                onChangeText={setNewHabit} // Update state on text input change
              />
              <Button title="Add Habit" onPress={handleAddHabit} /> {/* Button to add habit */}
            </ThemedView>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            {/* Conditionally render input for editing a habit */}
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedHabit}
                  onChangeText={setEditedHabit} // Update edited habit state on input change
                />
                <Button title="Save" onPress={handleSaveEdit} /> {/* Save edited habit */}
              </>
            ) : (
              <>
                <ThemedText>{item.name}</ThemedText>
                <View style={styles.actions}>
                  {/* Touchable elements for editing and deleting a habit */}
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
        nestedScrollEnabled={true} // Allow nested scroll if needed
        contentContainerStyle={styles.flatListContent} // Add custom padding to content
      />
    </ScreenWrapper>
  );
}