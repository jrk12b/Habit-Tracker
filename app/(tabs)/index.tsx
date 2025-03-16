import { useState, useEffect } from 'react';
import { TextInput, Button, FlatList, View, TouchableOpacity, SafeAreaView } from 'react-native';
import ScreenWrapper from '../screenWrapper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { loadHabits, addHabit, deleteHabit, updateHabit, initDatabase, getDb } from '../database';
import { Habit } from '../types';
import useStyles from '../styles/app';


export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedHabit, setEditedHabit] = useState('');
  const styles = useStyles();

  useEffect(() => {
    initDatabase();

    const loadHabitData = async () => {
      try {
        const habitsFromDb = await loadHabits();
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
        const newHabitObj: Habit = { id: id!, name: newHabit, completed: false };
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
      updateHabit(editingId, editedHabit);
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
    <ScreenWrapper>
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
                placeholderTextColor={styles.inputPlaceholder.color}
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
    </ScreenWrapper>
  );
}

