import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";
import { theme } from "../styles/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}
