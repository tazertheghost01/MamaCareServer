import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const SPLASH_DURATION = 7000;

export default function SplashScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    const timer = setTimeout(() => router.replace("/onboard"), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Decorative green blobs — top right */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo */}
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Tagline */}
          <Text style={styles.tagline}>
            Your trusted companion for a healthy{"\n"}pregnancy journey.
          </Text>

          {/* Dot divider */}
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i === 1 ? 18 : 6,
                    backgroundColor: i === 1 ? "#2D7A4F" : "#C8E6D0",
                  },
                ]}
              />
            ))}
          </View>

          {/* Hero image — woman holding baby */}
          <Image
            source={require("../assets/images/1.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Bottom loading */}
        <View style={styles.bottomSection}>
          <Animated.Text
            style={[styles.heart, { transform: [{ scale: pulseAnim }] }]}
          >
            🤍
          </Animated.Text>
          <Text style={styles.loadingText}>
            Preparing something amazing for you...
          </Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  blob1: {
    position: "absolute",
    top: -height * 0.12,
    right: -width * 0.18,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: "#D4EDE0",
  },
  blob2: {
    position: "absolute",
    top: -height * 0.09,
    right: -width * 0.12,
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: width * 0.31,
    backgroundColor: "#B8DFC8",
  },
  blob3: {
    position: "absolute",
    top: -height * 0.06,
    right: -width * 0.06,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "#9DD4B3",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: width * 0.55,
    height: 130,
    marginTop: 36,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 50,
    marginBottom: 10,
  },
  dots: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  heroImage: {
    width: width * 0.85,
    height: height * 0.48,
    marginTop: 4,
  },
  bottomSection: {
    paddingBottom: 36,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  heart: {
    fontSize: 18,
    marginBottom: 5,
  },
  loadingText: {
    fontSize: 12,
    color: "#AAA",
    marginBottom: 10,
  },
  progressTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2D7A4F",
    borderRadius: 2,
  },
});
