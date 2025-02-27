import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [habits, setHabits] = useState([
    { id: '1', name: 'Exercise', completed: false },
    { id: '2', name: 'Read a book', completed: false },
    { id: '3', name: 'Drink water', completed: false },
  ]);
  const [newHabit, setNewHabit] = useState('');

  // Toggle habit completion
  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  // Add new habit
  const addHabit = () => {
    if (newHabit.trim() === '') return; // Prevent empty habits
    setHabits([...habits, { id: Date.now().toString(), name: newHabit, completed: false }]);
    setNewHabit(''); // Clear input field after adding
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <IconSymbol 
              size={80} 
              color="#808080" 
              name="chevron.left.forwardslash.chevron.right"
              style={styles.headerImage} 
            />
            <ThemedText type="title">Daily Habits</ThemedText>

            {/* Input Field and Add Button */}
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
          <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitItem}>
            <ThemedText type="default">{item.name}</ThemedText>
            <ThemedText type="defaultSemiBold">
              {item.completed ? '✅' : '❌'}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center', 
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerImage: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});
