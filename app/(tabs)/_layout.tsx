import { Tabs } from "expo-router";
import AuthWrapper from "../../components/AuthWrapper";

export default function TabsLayout() {
  return (
    <AuthWrapper>
      <Tabs>
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="budget" options={{ title: "Budget" }} />
        <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      </Tabs>
    </AuthWrapper>
  );
}
