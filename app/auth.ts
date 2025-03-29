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
      await AsyncStorage.removeItem('userId');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const getAuthenticatedUserId = async (): Promise<number | null> => {
  try {
    const user = await getCurrentUser();
    return user?.id ?? null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
};