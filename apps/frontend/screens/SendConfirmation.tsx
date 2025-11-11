import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function SendConfirmation({ route, navigation }: any) {
  const { receiver, amount } = route.params;
  const [isSent, setIsSent] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the bar from 0 to 1 over 5 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      setIsSent(true);
    });
  }, []);

  // Interpolate width for the progress bar
  const widthAnim = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {!isSent ? (
        <>
          <View
            style={{
              marginTop: 200,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 45 }}>
              Sending ${amount} to {receiver}
            </Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[styles.progressBar, { width: widthAnim }]}
              />
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  textDecorationLine: "underline",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ marginTop: 180, alignItems: "center", gap: 40 }}>
          {/* Checkmark circle */}
          <View style={styles.checkContainer}>
            <Ionicons name="checkmark" size={35} color="white" />
          </View>

          <Text style={{ fontSize: 28, textAlign: "center", color: "#111827" }}>
            ${amount} sent to {receiver}!
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Homescreen")}
          >
            <Text style={styles.homeButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#f8fafc",
  },
  progressContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    marginTop: 60,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1D4ED8",
    borderRadius: 10,
  },
  checkContainer: {
    width: 50,
    height: 50,
    borderRadius: 60,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButtonText: {
    color: "#1D4ED8",
    fontSize: 18,
    fontWeight: "600",
  },
});
