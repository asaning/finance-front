import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function Budget() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Budget</Text>
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
