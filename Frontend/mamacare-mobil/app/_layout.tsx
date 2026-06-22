import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboard" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(auth)/sign-up" />
      <Stack.Screen name="(onboarding)/welcome" />
      <Stack.Screen name="(onboarding)/know-you" />
      <Stack.Screen name="(onboarding)/due-date" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(profile)" />
      < Stack.Screen name="(track)" />
    </Stack>
  );
}