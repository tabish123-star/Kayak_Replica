/*import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Button } from 'react-native';
import LoginApi from '../Screens/LoginApi';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const[navbutton,setnavbutton]=useState('')
  const [isLoading, setIsLoading] = useState(false);

  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await LoginApi.createUser(email, password,);
      Alert.alert('Success', 'User created successfully');
      navigation.navigate('SearchScreen');
       // navigation.navigate('SearchScreen');
    } catch (error) {
      console.error('Signup error:', error.message);
      Alert.alert('Error', error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={secureTextEntry}
        />
        <TouchableOpacity onPress={toggleSecureEntry} style={styles.toggleButton}>
          <Text style={styles.toggleText}>{secureTextEntry ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>
        


   
      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
          
        )}
      </TouchableOpacity>
    </SafeAreaView>  
  ) 
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', marginTop: 20 },
  inputContainer: { marginBottom: 20, position: 'relative' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: { height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
  toggleButton: { position: 'absolute', right: 15, top: 40 },
  toggleText: { color: '#FF6D00', fontSize: 14, fontWeight: '500' },
  button: { backgroundColor: '#FF6D00', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  disabledButton: { backgroundColor: '#cccccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SignupScreen;*/
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LoginApi from '../Screens/LoginApi';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // toggle between signup/login

  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);

  // ---- Signup Handler ----
  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await LoginApi.createUser(email, password);
      Alert.alert('Success', 'User created successfully');
      //navigation.navigate('RecommendationsScreen');
       navigation.navigate('SearchScreen');
    } catch (error) {
      Alert.alert('Error', error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Login Handler ----
  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await LoginApi.checkUserByEmail(email);

      if (response && response.UserID) {
        Alert.alert('Success', 'Login successful!');
        navigation.navigate('SearchScreen');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {showLogin ? 'Login to Your Account' : 'Create Your Account'}
      </Text>

      {/* ===== Signup Form ===== */}
      {!showLogin && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity
              onPress={toggleSecureEntry}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {secureTextEntry ? 'Show' : 'Hide'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <TouchableOpacity onPress={() => setShowLogin(true)}>
            <Text style={styles.switchText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* ===== Login Form ===== */}
      {showLogin && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Switch back to Signup */}
          <TouchableOpacity onPress={() => setShowLogin(false)}>
            <Text style={styles.switchText}>
              Don’t have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  inputContainer: { marginBottom: 20, position: 'relative' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  toggleButton: { position: 'absolute', right: 15, top: 40 },
  toggleText: { color: '#FF6D00', fontSize: 14, fontWeight: '500' },
  button: {
    backgroundColor: '#FF6D00',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { backgroundColor: '#cccccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: {
    marginTop: 15,
    color: '#FF6D00',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SignupScreen;

