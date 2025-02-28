import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function TabTwoScreen() {
  const [habits, setHabits] = useState([
    { id: '1', name: 'Exercise', completed: false },
    { id: '2', name: 'Read a book', completed: false },
    { id: '3', name: 'Drink water', completed: false },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editedHabitName, setEditedHabitName] = useState('');

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const addHabit = () => {
    if (newHabit.trim() === '') return;
    setHabits([...habits, { id: Date.now().toString(), name: newHabit, completed: false }]);
    setNewHabit('');
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const startEditing = (id: string, name: string) => {
    setEditingHabitId(id);
    setEditedHabitName(name);
  };

  const saveEditedHabit = () => {
    if (!editingHabitId) return;

    setHabits(habits.map(habit => 
      habit.id === editingHabitId ? { ...habit, name: editedHabitName } : habit
    ));

    setEditingHabitId(null);
    setEditedHabitName('');
  };

  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
              <ThemedText type="defaultSemiBold">
                {item.completed ? '✅' : '❌'}
              </ThemedText>
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
    backgroundColor: '#fff',
  },
  deleteButtonSwipe: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});
