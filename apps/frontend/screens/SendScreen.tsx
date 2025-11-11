import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { InputField } from "@/components";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

export function SendScreen({ navigation }: any) {
  const users = [
    {
      id: "1",
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    { id: "2", name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: "3", name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: "4", name: "Diana", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: "5", name: "Eve", avatar: "https://i.pravatar.cc/150?img=5" },
  ];

  const [receiver, setReceiver] = useState(null);
  const userPress = (user) => {
    setReceiver(user);
  };

  const selectedUserId = receiver?.id;

  const [amount, setAmount] = useState("");

  const handlePress = (val) => {
    if (val === ".") {
      // Allow only one decimal point
      if (!amount.includes(".")) {
        setAmount((prev) => (prev === "" ? "0." : prev + "."));
      }
    } else {
      // Regular number press
      setAmount((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Homescreen")}>
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Send Money</Text>
        <Ionicons name="search-sharp" size={24} color="black" />
      </View>

      <View
        style={{
          marginTop: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 25,
        }}
      >
        <TouchableOpacity>
          <Ionicons name="add-sharp" size={24} color="black" />
          <Text>Add</Text>
        </TouchableOpacity>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => userPress(user)}
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: user.avatar }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: receiver?.id === user.id ? 3.5 : 1.5,
                borderColor: receiver?.id === user.id ? "#1D4ED8" : "#CBD5E1",
                // marginRight: 15,
              }}
            />
            <Text
              style={{
                fontSize: 15,
                paddingTop: 4,
                color: receiver?.id === user.id ? "#1D4ED8" : "#475569",
                fontWeight: receiver?.id === user.id ? "600" : "400",
              }}
            >
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View
        style={{
          marginTop: 30,
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {/* <Text style={{ fontSize: 15, color: "#475569" }}>
          To: {receiver ? receiver.name : "Select Recipient"}
        </Text> */}
        {/* <Text>Balance: $12,890.81</Text> */}
        <Text style={{ fontSize: 15, color: "#475569" }}>Enter Amount</Text>
        <Text style={{ fontSize: 60 }}>$ {amount || "0"}</Text>

        <View style={styles.keyboard}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            [".", "0", "⌫"],
          ].map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() =>
                    key === "⌫" ? handleDelete() : handlePress(key)
                  }
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.buttonWrapper}
          activeOpacity={0.8}
          // onPress={() => navigation.navigate("SendConfirmation")}
          //LEFT OFF HERE -> Trying to go to send confirmation screen with params
          onPress={() => {
            if (receiver && amount) {
              navigation.navigate("SendConfirmation", {
                receiver: receiver.name, // or receiver object if you prefer
                amount: amount,
              });
            }
          }}
        >
          <LinearGradient
            colors={["#1E3A8A", "#1E40AF", "#172554"]} // gradient blues
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.text}>
              Send {receiver ? receiver.name : ""} ${amount || "0"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  keyboard: {
    marginTop: 30,
    gap: 45,
    // backgroundColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
  },
  key: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  keyText: {
    // color: "",
    fontSize: 22,
    fontWeight: "600",
  },
  buttonWrapper: {
    width: "100%",
    alignSelf: "center",
    marginTop: 30,
    borderRadius: 25,
    overflow: "hidden", // ensures gradient corners match the button
  },
  gradient: {
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
