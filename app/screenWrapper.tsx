import { SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import useStyles from "./styles/app";

interface ScreenWrapperProps {
  children: React.ReactNode;
}

export default function ScreenWrapper({ children }: ScreenWrapperProps) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>{children}</ThemedView>
    </SafeAreaView>
  );
}
