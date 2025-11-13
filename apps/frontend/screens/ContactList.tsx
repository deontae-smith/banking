import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ContactList({ route, navigation }: any) {
  const contacts = [
    {
      id: 1,
      name: "Ava Thompson",
      avatar: "https://randomuser.me/api/portraits/women/38.jpg",
    },
    {
      id: 2,
      name: "Benjamin Clark",
      avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    },
    {
      id: 3,
      name: "Charlotte Davis",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    {
      id: 4,
      name: "Daniel Kim",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    },
    {
      id: 5,
      name: "Ella Rivera",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    },
    {
      id: 6,
      name: "Ethan Wilson",
      avatar: "https://randomuser.me/api/portraits/men/73.jpg",
    },
    {
      id: 7,
      name: "Grace Miller",
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    {
      id: 8,
      name: "Harper White",
      avatar: "https://randomuser.me/api/portraits/women/48.jpg",
    },
    {
      id: 9,
      name: "Henry Moore",
      avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    },
    {
      id: 10,
      name: "Isabella Lopez",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      id: 11,
      name: "James Turner",
      avatar: "https://randomuser.me/api/portraits/men/19.jpg",
    },
    {
      id: 12,
      name: "Liam Anderson",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      id: 13,
      name: "Lucas Martinez",
      avatar: "https://randomuser.me/api/portraits/men/35.jpg",
    },
    {
      id: 14,
      name: "Mia Brown",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
    },
    {
      id: 15,
      name: "Noah Johnson",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    },
    {
      id: 16,
      name: "Oliver Harris",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    },
    {
      id: 17,
      name: "Olivia Robinson",
      avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    },
    {
      id: 18,
      name: "Sophia Lewis",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      id: 19,
      name: "William Scott",
      avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    },
    {
      id: 20,
      name: "Zoe Carter",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
  ];
  const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
  const groupedContacts = sortedContacts.reduce((groups: any, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(contact);
    return groups;
  }, {});

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const toggleMenu = (contact: any, event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setSelectedContact(contact);
    setMenuPosition({ top: pageY - 50, right: 50 }); // adjust position
    setMenuVisible(!menuVisible);
  };

  const handleBlock = () => {
    console.log(`Blocked ${selectedContact.name}`);
    setMenuVisible(false);
  };

  const handleRemove = () => {
    console.log(`Removed ${selectedContact.name}`);
    setMenuVisible(false);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity>
          <Ionicons name="list-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(groupedContacts).map((letter) => (
          <View key={letter}>
            <Text style={styles.sectionHeader}>{letter}</Text>
            {groupedContacts[letter].map((contact: any, index: number) => (
              <View key={contact.id}>
                <View style={styles.contactRow}>
                  <TouchableOpacity
                    style={styles.contactMain}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("SendScreen", { receiver: contact })
                    }
                  >
                    <Image
                      source={{ uri: contact.avatar }}
                      style={styles.avatar}
                    />
                    <Text style={styles.contactName}>{contact.name}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => toggleMenu(contact, e)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="ellipsis-horizontal-sharp"
                      size={22}
                      color="#475569"
                    />
                  </TouchableOpacity>
                </View>

                {/* Always show divider */}
                <View style={styles.divider} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      {menuVisible && (
        <View
          style={[
            styles.popupMenu,
            { top: menuPosition.top, right: menuPosition.right },
          ]}
        >
          <TouchableOpacity style={styles.popupItem} onPress={handleBlock}>
            <Ionicons name="ban-outline" size={16} color="#dc2626" />
            <Text style={[styles.popupText, { color: "#dc2626" }]}>Block</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.popupItem} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={16} color="#475569" />
            <Text style={styles.popupText}>Remove</Text>
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
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 30,
    marginBottom: 0,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  contactMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 15,
  },
  contactName: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  divider: {
    height: 1.5,
    backgroundColor: "#e2e8f0",
  },
  popupMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    width: 140,
  },
  popupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  popupText: {
    fontSize: 15,
    color: "#475569",
  },
});
