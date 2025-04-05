import React, { useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  TextInput,
  Button,
} from "react-native";
// eslint-disable-next-line import/no-unresolved
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "../screenWrapper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { loadHabits, updateHabit, getDb } from "../database";
import { Habit, TabsParamList } from "../types";
import useStyles from "../styles/app";
import { getAuthenticatedUserId } from "../auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const HabitsScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editedHabitName, setEditedHabitName] = useState("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const styles = useStyles();
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      const loadHabitData = async () => {
        try {
          const userId = await getAuthenticatedUserId();
          if (!userId) {
            console.log("No user ID found. Redirecting to login...");
            navigation.navigate("index");
            return;
          }

          const habitsFromDb = await loadHabits(userId);
          setHabits(habitsFromDb);
        } catch (error) {
          console.error("Failed to load habits:", error);
        }
      };

      loadHabitData();
      setCurrentDate(getCurrentDate());
    }, [navigation]),
  );

  // Get current date formatted as YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toggleHabit = async (id: number) => {
    try {
      const updatedHabits = habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit,
      );
      setHabits(updatedHabits);

      const habitToUpdate = updatedHabits.find((habit) => habit.id === id);
      if (habitToUpdate) {
        await updateHabit(habitToUpdate.id, habitToUpdate.name);
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
  };

  const startEditing = (id: number, name: string) => {
    setEditingHabitId(id);
    setEditedHabitName(name);
  };

  // Save edited habit to the database
  const saveEditedHabit = async () => {
    if (!editingHabitId) return;

    const updatedHabits = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedHabitName } : habit,
    );
    setHabits(updatedHabits);

    await updateHabit(editingHabitId, editedHabitName);

    setEditingHabitId(null);
    setEditedHabitName("");
  };

  const handleSubmitHabits = async () => {
    try {
      const today = getCurrentDate();
      const db = getDb();

      // Get the current user's ID
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User is not logged in.");
        return;
      }

      // Check if habits have already been submitted today
      const existingEntries = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM habit_entries WHERE date = ? AND user_id = ?`,
        [today, userId],
      );

      if (existingEntries[0]?.count > 0) {
        console.log("Habits already submitted for today. Submission blocked.");
        return; // Prevent resubmission
      }

      // Iterate through the current habits and save them to the database
      await Promise.all(
        habits.map(async (habit) => {
          await db.execAsync(`
            INSERT INTO habit_entries (date, habit_id, completed, user_id) 
            VALUES ('${today}', ${habit.id}, ${habit.completed ? 1 : 0}, ${userId});
          `);
        }),
      );

      console.log("Habits submitted for today!");
    } catch (error) {
      console.error("Failed to submit habits:", error);
    }
  };

  return (
    <ScreenWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <ThemedText type="title">Daily Habits</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.dateText}>
                {currentDate}
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: 16 }}>
              <Button title="Submit Habits" onPress={handleSubmitHabits} />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleHabit(item.id)}
              style={styles.habitItem}
            >
              {editingHabitId === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editedHabitName}
                  onChangeText={setEditedHabitName}
                  autoFocus
                  onBlur={saveEditedHabit}
                  onSubmitEditing={saveEditedHabit} // Save on submit
                />
              ) : (
                <TouchableOpacity
                  onPress={() => startEditing(item.id, item.name)}
                >
                  <ThemedText type="default">{item.name}</ThemedText>
                </TouchableOpacity>
              )}
              <ThemedText type="defaultSemiBold">
                {item.completed ? "✅" : "❌"}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};

export default HabitsScreen;
