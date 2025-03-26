import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from './database';

export const getCurrentUser = async () => {
  try {
    const storedUserId = await AsyncStorage.getItem('userId');
    
    if (!storedUserId) {
      return null;
    }

    // Verify user exists in SQLite
    const user = await getUserById(parseInt(storedUserId));

    if (user) {
      return { id: user.id, uid: user.uid };
    } else {
      // If user not found in SQLite, remove from AsyncStorage and return null
      await AsyncStorage.removeItem('userId');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};