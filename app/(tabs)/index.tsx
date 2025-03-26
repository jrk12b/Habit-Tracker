import { useState, useEffect } from 'react';
import { TextInput, Button, FlatList, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenWrapper from '../screenWrapper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { loadHabits, addHabit, deleteHabit, updateHabit, initDatabase } from '../database';
import { Habit } from '../types';
import useStyles from '../styles/app';
import { getCurrentUser } from '../auth';
import { addUser, getUserById, getUserByUid } from '../database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedHabit, setEditedHabit] = useState('');
  const [userId, setUserId] = useState<string | null>(null); // Track authenticated user ID
  const [username, setUsername] = useState(''); // Track username input
  const [password, setPassword] = useState(''); // Track password input
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if user is logged in
  const [isSignUp, setIsSignUp] = useState(false); // Track whether the user is in sign-up or login form
  const styles = useStyles();

  useEffect(() => {
    const fetchUserAndHabits = async () => {
      try {
        await initDatabase();
        const user = await getCurrentUser(); // Assuming this retrieves the logged-in user
        console.log('Current User: ', user);
        if (user) {
          setUserId(user.id.toString());
          const habitsFromDb = await loadHabits(user.id); // Pass user ID to filter habits
          setHabits(habitsFromDb); // Set the habits for this user
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Failed to load user or habits:', error);
        setIsLoggedIn(false);
      }
    };
  
    fetchUserAndHabits();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await getUserByUid(username); // Get user ID by username
  
      if (user) {
        setUserId(user.id.toString()); // Store user ID
        setIsLoggedIn(true);
        await AsyncStorage.setItem('userId', user.id.toString()); // Save to session
        console.log('Logged in User:', user);
      } else {
        alert('User not found. Please sign up first.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      const existingUser = await getUserByUid(username); // Check if user exists
  
      if (existingUser) {
        alert('User already exists. Please log in.');
      } else {
        const newUserId = await addUser(username, password); // Create new user
        setUserId(newUserId.toString());
        setIsLoggedIn(true);
        await AsyncStorage.setItem('userId', newUserId.toString());
        console.log('User signed up:', newUserId);
      }
    } catch (error) {
      console.error('Sign-up error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Remove user ID from AsyncStorage
      await AsyncStorage.removeItem('userId');
  
      // Confirm it's removed
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        console.warn('User ID was not removed properly');
      } else {
        console.log('User successfully logged out');
      }
  
      // Reset state to reflect logout
      setUserId(null);
      setIsLoggedIn(false);
  
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const handleAddHabit = () => {
    if (newHabit.trim() !== '' && userId) {
      addHabit(newHabit.trim(), parseInt(userId), (id) => { // Trim the newHabit to remove any extra spaces
        setHabits((prev) => [...prev, { id: id!, name: newHabit.trim(), completed: false, userId: parseInt(userId) }]);
      });
      setNewHabit('');
    } else {
      console.error('Habit name cannot be empty');
    }
  };

  const handleStartEditing = (id: number) => {
    setEditingId(id);
    const habitToEdit = habits.find((habit) => habit.id === id);
    if (habitToEdit) {
      setEditedHabit(habitToEdit.name);
    }
  };

  const handleSaveEdit = () => {
    if (editedHabit.trim() !== '' && editingId !== null) {
      updateHabit(editingId, editedHabit);
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingId ? { ...habit, name: editedHabit } : habit
        )
      );
      setEditingId(null);
      setEditedHabit('');
    }
  };

  const handleDeleteHabit = (id: number) => {
    deleteHabit(id, () => {
      setHabits((prev) => prev.filter((habit) => habit.id !== id && habit.userId === parseInt(userId))); // Filter only the habits that belong to the current user
    });
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              {isLoggedIn ? (
                <>
                  <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Set Your Daily Habits</ThemedText>
                  </ThemedView>

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
                  <Button title="Log Out" onPress={handleLogout} />
                </>
              ) : (
                <ThemedView>
                  {isSignUp ? (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                      <Button title="Sign Up" onPress={handleSignUp} />
                      <TouchableOpacity onPress={() => setIsSignUp(false)}>
                        <ThemedText>Already have an account? Log in</ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                      <Button title="Log In" onPress={handleLogin} />
                      <TouchableOpacity onPress={() => setIsSignUp(true)}>
                        <ThemedText>Don't have an account? Sign up</ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </ThemedView>
              )}
            </>
          }
          renderItem={({ item }) => (
            isLoggedIn ? (
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
            ) : null
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}