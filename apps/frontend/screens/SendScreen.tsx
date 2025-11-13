import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { getBackendUrl } from "@/libs/getAPIUrl";
import { useUser } from "@clerk/clerk-expo";
import { useUserContacts } from "@/hooks/useUserContacts";
import { useSendMoney } from "@/hooks/useSendMoneyProcess";

interface UserContact {
  clerk_id: string;
  firstName: string;
  phoneNumber: string;
}

export function SendScreen({ navigation }: any) {
  const [receiver, setReceiver] = useState<UserContact | null>(null);
  const [amount, setAmount] = useState("");

  // pass id via homescreen

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState("");
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const tunnelUrl = getBackendUrl();

  const { user } = useUser();
  const { contacts } = useUserContacts(user?.id);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddUser = async () => {
    if (newPhone.length !== 10) {
      setError("Phone number is invalid");
      triggerShake();
      return;
    }

    // Clear previous errors
    setError("");

    try {
      const response = await fetch(`${tunnelUrl}/api/user/add-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user?.id, // The logged-in user's Convex ID
          phoneNumber: newPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "User not found") {
          setError("User not found");
          triggerShake();
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      // ✅ Success: contact added
      console.log("Contact added:", data.contacts);
      // You could also refresh contact list here if needed

      // Reset form
      setNewName("");
      setNewPhone("");
      setShowAddModal(false);
    } catch (err) {
      console.error("❌ Failed to add contact:", err);
      setError("Failed to connect to server");
      triggerShake();
    }
  };

  const handlePress = (val) => {
    if (val === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => (prev === "" ? "0." : prev + "."));
      }
    } else {
      setAmount((prev) => prev + val);
    }
  };

  const handleDelete = () => setAmount((prev) => prev.slice(0, -1));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Homescreen")}>
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Send Money</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ContactList")}>
          <Ionicons name="list-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* User List with Scroll */}
      {/* User List */}
      <View style={{ marginTop: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 5,
          }}
        >
          {/* Add Button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{ alignItems: "center", marginRight: 20 }}
          >
            <View style={styles.addButton}>
              <Ionicons name="add-sharp" size={28} color="#1E3A8A" />
            </View>
            <Text
              style={{ textAlign: "center", color: "#1E3A8A", marginTop: 4 }}
            >
              Add
            </Text>
          </TouchableOpacity>

          {contacts?.map((user) => {
            // Generate a consistent color per user
            const color = `hsl(${[...user.clerk_id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360}, 70%, 70%)`;

            const isSelected = receiver?.clerk_id === user.clerk_id;

            return (
              <TouchableOpacity
                key={user.clerk_id}
                onPress={
                  () => setReceiver((prev) => (isSelected ? null : user)) // toggle selection
                }
                style={{ alignItems: "center", marginRight: 20 }}
              >
                {/* Circle with first initial */}
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: color,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: isSelected ? 3.5 : 1.5,
                    borderColor: isSelected ? "#1D4ED8" : "#CBD5E1",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}
                  >
                    {user.firstName[0].toUpperCase()}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    marginTop: 4,
                    color: isSelected ? "#1D4ED8" : "#475569",
                    fontWeight: isSelected ? "600" : "400",
                  }}
                >
                  {user.firstName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          marginTop: 30,
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 15, color: "#475569" }}>Enter Amount</Text>
        <Text style={{ fontSize: 60 }}>$ {amount || "0"}</Text>

        {/* Number Pad */}
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

        {/* Send Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          activeOpacity={0.8}
          onPress={() => {
            if (receiver && amount) {
              navigation.navigate("SendConfirmation", {
                receiver: {
                  clerk_id: receiver.clerk_id,
                  firstName: receiver.firstName,
                  phoneNumber: receiver.phoneNumber,
                },
                amount: amount,
              });
            }
          }}
        >
          <LinearGradient
            colors={["#1E3A8A", "#1E40AF", "#172554"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.text}>
              Send {receiver ? receiver.firstName : ""} ${amount || "0"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Contact</Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                placeholder="Phone Number"
                value={newPhone}
                onChangeText={(text) => {
                  setNewPhone(text.replace(/[^0-9]/g, "")); // allow only digits
                  if (error) setError("");
                }}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  { borderColor: error ? "#DC2626" : "#CBD5E1" },
                ]}
              />
            </Animated.View>

            {error ? (
              <Text style={{ color: "#DC2626", fontSize: 13, marginBottom: 5 }}>
                {error}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={[styles.modalButton, { backgroundColor: "#CBD5E1" }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddUser}
                style={[styles.modalButton, { backgroundColor: "#1D4ED8" }]}
                disabled={!newPhone}
              >
                <Text style={{ color: "#fff" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "600" },
  userRow: {
    alignItems: "center",
    paddingRight: 20,
  },
  userItem: {
    alignItems: "center",
    marginRight: 25,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 25,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  keyboard: { marginTop: 30, gap: 45 },
  row: { flexDirection: "row", justifyContent: "center", gap: 50 },
  key: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: { fontSize: 22, fontWeight: "600" },
  buttonWrapper: {
    width: "100%",
    alignSelf: "center",
    marginTop: 30,
    borderRadius: 25,
    overflow: "hidden",
  },
  gradient: { padding: 15, alignItems: "center", borderRadius: 25 },
  text: { color: "#fff", fontSize: 18, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 10,
  },
});
