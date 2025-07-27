import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Home</Text>
      <Button mode="contained" onPress={logout}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
