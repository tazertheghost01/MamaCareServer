import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pregnancy-overview" />
      <Stack.Screen name="my-goals" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="about" />
      <Stack.Screen name="sign-out" />
      <Stack.Screen name="help" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}