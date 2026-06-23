import { Stack } from "expo-router";

export default function TrackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="appointment" />
      <Stack.Screen name="add-appointment" />
      <Stack.Screen name="medication" />
      <Stack.Screen name="add-medication" />
      <Stack.Screen name="walk" />
      <Stack.Screen name="walk-session" />
      <Stack.Screen name="baby-growth" />
    </Stack>
  );
}