import { Stack } from "expo-router";
import "../global.css";
import "./i18n";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboard" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(auth)/sign-up" />
      <Stack.Screen name="(auth)/verify-otp" />
      <Stack.Screen name="(onboarding)/welcome" />
      <Stack.Screen name="(onboarding)/know-you" />
      <Stack.Screen name="(onboarding)/due-date" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
