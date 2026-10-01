import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const API_URL = "http://10.147.154.105/praticeproject/api/User/Createprofile";

const Person = ({ navigation }) => {
  const [adults, setAdults] = useState("");
  const [children, setchildren] = useState("");

  const savedata = async () => {
    if (!adults || !children) {
      Alert.alert("Validation Error", "Please enter Adults and Children");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Adults: parseInt(adults),
          Children: parseInt(children),
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        Alert.alert("Success", "Data saved successfully");
        console.log("Profile created successfully:", data);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", "Failed to save data: " + errorText);
        console.log("Data not saved", errorText);
      }
    } catch (error) {
      Alert.alert("Exception", "Something went wrong: " + error.message);
      console.log("Error:", error);
    }
  };

  const handleDefaultFamily = async () => {
    try {
      const response = await fetch(
        "http://10.147.154.105/praticeproject/api/User/GetProfile"
      );

      if (response.ok) {
        const latest = await response.json();
       // const latest = data[0];

        if (latest) {
           setAdults(String(latest.Adults));
        setchildren(String(latest.Children));
          navigation.navigate("SearchScreen", {
            adults: latest.Adults,
            children: latest.Children,
          });
        } else {
          Alert.alert("Info", "No profile data found");
        }
      } else {
        const errorText = await response.text();
        Alert.alert("Error", "Failed to fetch data: " + errorText);
      }
    } catch (error) {
      Alert.alert("Exception", "Something went wrong: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Details</Text>

      <Text style={styles.label}>Adults</Text>
      <TextInput
        placeholder="Enter number of adults"
        value={adults}
        onChangeText={setAdults}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Children</Text>
      <TextInput
        placeholder="Enter number of children"
        value={children}
        onChangeText={setchildren}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveButton} onPress={savedata}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.defaultButton}
        onPress={handleDefaultFamily}
      >
        <Text style={styles.defaultButtonText}>Default Family</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Person;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  defaultButton: {
    marginTop: 15,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  defaultButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
