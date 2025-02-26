import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [habits, setHabits] = useState([
    { id: '1', name: 'Exercise', completed: false },
    { id: '2', name: 'Read a book', completed: false },
    { id: '3', name: 'Drink water', completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
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
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitItem}>
            <ThemedText type="default">{item.name}</ThemedText>
            <ThemedText type="defaultSemiBold">
              {item.completed ? '❌' : '✅'}
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
    paddingTop: 50,  // Moves header image down
    paddingBottom: 20, // Adds space between image and title
  },
  headerImage: {
    marginBottom: 10, // Creates space between the image and title
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
