import { SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import styles from './styles/app';

interface ScreenWrapperProps {
  children: React.ReactNode;
}

export default function ScreenWrapper({ children }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>{children}</ThemedView>
    </SafeAreaView>
  );
}