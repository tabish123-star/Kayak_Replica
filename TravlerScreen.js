/*import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const TravelerScreen = ({ navigation, route }) => {
  const { initialValues } = route.params;
  const [travelers, setTravelers] = useState({
    cabinClass: initialValues?.cabinClass || 'Economy',
    adults: initialValues?.adults || 1,
    seniors: initialValues?.seniors || 0,
    children: initialValues?.children || 0
  });

  const MAX_TRAVELERS = 9;

  const handleCounterChange = (type, delta) => {
    setTravelers(prev => {
      const newValue = prev[type] + delta;
      const totalTravelers = prev.adults + prev.seniors + prev.children + delta;
      
      // Validate maximum travelers
      if (totalTravelers > MAX_TRAVELERS) {
        Alert.alert(`Maximum ${MAX_TRAVELERS} travelers allowed`);
        return prev;
      }

      // Validate minimum values
      if (type === 'adults' && newValue < 1) return prev;
      if (newValue < 0) return prev;

      return { ...prev, [type]: newValue };
    });
  };

  const saveAndExit = () => {
    if (travelers.adults + travelers.seniors + travelers.children === 0) {
      Alert.alert('Invalid Selection', 'At least one traveler is required');
      return;
    }
    
    route.params?.onSave(travelers);
    navigation.goBack();
  };

  const TravelerCounter = ({ type, count, fieldName, min = 0 }) => (
    <View style={styles.counterContainer}>
      <View>
        <Text style={styles.counterLabel}>{type}</Text>
        {min > 0 && <Text style={styles.ageHint}>(Minimum {min} required)</Text>}
      </View>
      <View style={styles.counterButtons}>
        <TouchableOpacity 
          style={[styles.counterButton, count <= min && styles.disabledButton]} 
          onPress={() => handleCounterChange(fieldName, -1)}
          disabled={count <= min}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity 
          style={[styles.counterButton, (travelers.adults + travelers.seniors + travelers.children) >= MAX_TRAVELERS && styles.disabledButton]}
          onPress={() => handleCounterChange(fieldName, 1)}
          disabled={(travelers.adults + travelers.seniors + travelers.children) >= MAX_TRAVELERS}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Traveler Options</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabin Class</Text>
          <View style={styles.classContainer}>
            {['Economy', 'Premium Economy', 'Business'].map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classButton,
                  travelers.cabinClass === cls && styles.activeClassButton
                ]}
                onPress={() => setTravelers(prev => ({ ...prev, cabinClass: cls }))}
              >
                <Text style={travelers.cabinClass === cls ? styles.activeClassText : styles.classText}>
                  {cls}
                </Text>
                {travelers.cabinClass === cls && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travelers</Text>
          <Text style={styles.travelerLimit}>
            {MAX_TRAVELERS - (travelers.adults + travelers.seniors + travelers.children)} seats remaining
          </Text>
          
          <View style={styles.travelerTypeContainer}>
            <TravelerCounter 
              type="Adults (12+ years)"
              count={travelers.adults}
              fieldName="adults"
              min={1}
            />
            <TravelerCounter 
              type="Seniors (60+ years)"
              count={travelers.seniors}
              fieldName="seniors"
            />
            <TravelerCounter 
              type="Children (2-11 years)"
              count={travelers.children}
              fieldName="children"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveAndExit}
          disabled={travelers.adults === 0}
        >
          <Text style={styles.saveButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 24,
    color: '#0066CC',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  travelerLimit: {
    color: '#666',
    marginBottom: 16,
    fontSize: 14,
  },
  classContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classButton: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  activeClassButton: {
    borderColor: '#0066CC',
    backgroundColor: '#f0f8ff',
  },
  classText: {
    fontSize: 16,
    color: '#666',
  },
  activeClassText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  counterLabel: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  ageHint: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 4,
  },
  counterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF6D00',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TravelerScreen;*/


/*import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';

const TravelerScreen = ({ navigation, route }) => {
  //const {
  //  adults = route.params.adults,
  //  seniors = 0,
   // children = 0,
   // cabinClass = 'Economy',
 // } = route.params.initialValues || {};
// TravelerScreen.js
const {
  adults = route.params?.adults || 1,
  children = route.params?.children || 0,
 // seniors = route.params?.seniors || 0,
  cabinClass = route.params?.cabinClass || 'Economy',
} = route.params.initialValues || {};

  const [travelers, setTravelers] = useState({
    cabinClass,
    adults,
    //seniors,
    children
  });
  // TravelerScreen.js

  const MAX_TRAVELERS = 9;

  const handleCounterChange = (type, delta) => {
    setTravelers(prev => {
      const newValue = prev[type] + delta;
      const totalTravelers = prev.adults + prev.children + delta;

      if (totalTravelers > MAX_TRAVELERS) {
        Alert.alert(`Maximum ${MAX_TRAVELERS} travelers allowed`);
        return prev;
      }

      if (type === 'adults' && newValue < 1) return prev;
      if (newValue < 0) return prev;

      return { ...prev, [type]: newValue };
    });
  };

  const saveAndExit = () => {
    if (travelers.adults + travelers.seniors + travelers.children === 0) {
      Alert.alert('Invalid Selection', 'At least one traveler is required');
      return;
    }

    // Pass back both the updated travelers AND the original state
    navigation.navigate('SearchScreen', {
      ...route.params.currentState,   // Original state from FlightSearchScreen
      updatedTravelers: travelers     // Updated travelers from this screen
    });
  };

  const TravelerCounter = ({ type, count, fieldName, min = 0 }) => (
    <View style={styles.counterContainer}>
      <View>
        <Text style={styles.counterLabel}>{type}</Text>
        {min > 0 && <Text style={styles.ageHint}>(Minimum {min} required)</Text>}
      </View>
      <View style={styles.counterButtons}>
        <TouchableOpacity 
          style={[styles.counterButton, count <= min && styles.disabledButton]} 
          onPress={() => handleCounterChange(fieldName, -1)}
          disabled={count <= min}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity 
          style={[styles.counterButton, (travelers.adults  + travelers.children) >= MAX_TRAVELERS && styles.disabledButton]}
          onPress={() => handleCounterChange(fieldName, 1)}
          disabled={(travelers.adults + travelers.children) >= MAX_TRAVELERS}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Traveler Options</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabin Class</Text>
          <View style={styles.classContainer}>
            {['Economy', 'PremiumEconomy', 'Business', 'First'].map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classButton,
                  travelers.cabinClass === cls && styles.activeClassButton
                ]}
                onPress={() => setTravelers(prev => ({ ...prev, cabinClass: cls }))}
              >
                <Text style={travelers.cabinClass === cls ? styles.activeClassText : styles.classText}>
                  {cls}
                </Text>
                {travelers.cabinClass === cls && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travelers</Text>
          <Text style={styles.travelerLimit}>
            {MAX_TRAVELERS - (travelers.adults +travelers
              .seniors + travelers.children)} seats remaining
          </Text>

          <View style={styles.travelerTypeContainer}>
            <TravelerCounter 
              type="Adults (12+ years)"
              count={travelers.adults}
              fieldName="adults"
              min={1}
            />
            <TravelerCounter 
            //  type="Seniors (60+ years)"
             // count={travelers.seniors}
             // fieldName="seniors"
            />
            <TravelerCounter 
              type="Children (2-11 years)"
              count={travelers.children}
              fieldName="children"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveAndExit}
          disabled={travelers.adults === 0}
        >
          <Text style={styles.saveButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { fontSize: 24, color: '#0066CC', marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  travelerLimit: { color: '#666', marginBottom: 16, fontSize: 14 },
  classContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  classButton: { width: '48%', padding: 16, borderWidth: 1, borderColor: '#e9ecef', borderRadius: 8, marginBottom: 12, alignItems: 'center', height: 60, position: 'relative' },
  activeClassButton: { borderColor: '#0066CC', backgroundColor: '#f0f8ff' },
  classText: { fontSize: 16, color: '#666' },
  activeClassText: { color: '#0066CC', fontWeight: '600' },
  selectedIndicator: { position: 'absolute', top: 4, right: 4, backgroundColor: '#0066CC', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  selectedIndicatorText: { color: '#fff', fontSize: 14 },
  counterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  counterLabel: { fontSize: 16, color: '#333', flex: 2 },
  ageHint: { fontSize: 12, color: '#868e96', marginTop: 4 },
  counterButtons: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  counterButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#e9ecef' },
  counterButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterValue: { width: 40, textAlign: 'center', fontSize: 16, color: '#333', fontWeight: '500' },
  saveButton: { backgroundColor: '#FF6D00', borderRadius: 8, padding: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default TravelerScreen;*/
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';

const TravelerScreen = ({ navigation, route }) => {
  const {
    adults = route.params?.adults || 1,
    children = route.params?.children || 0,
    cabinClass = route.params?.cabinClass || 'Economy',
  } = route.params.initialValues || {};

  const [travelers, setTravelers] = useState({
    cabinClass,
    adults,
    children
  });

  const MAX_TRAVELERS = 9;

  const handleCounterChange = (type, delta) => {
    setTravelers(prev => {
      const newValue = prev[type] + delta;
      const totalTravelers = prev.adults + prev.children + delta;

      if (totalTravelers > MAX_TRAVELERS) {
        Alert.alert(`Maximum ${MAX_TRAVELERS} travelers allowed`);
        return prev;
      }

      if (type === 'adults' && newValue < 1) return prev;
      if (newValue < 0) return prev;

      return { ...prev, [type]: newValue };
    });
  };

  const saveAndExit = () => {
    if (travelers.adults + travelers.children === 0) {
      Alert.alert('Invalid Selection', 'At least one traveler is required');
      return;
    }

    navigation.navigate('SearchScreen', {
      ...route.params.currentState,
      updatedTravelers: travelers
    });
  };

  const TravelerCounter = ({ type, count, fieldName, min = 0 }) => (
    <View style={styles.counterContainer}>
      <View>
        <Text style={styles.counterLabel}>{type}</Text>
        {min > 0 && <Text style={styles.ageHint}>(Minimum {min} required)</Text>}
      </View>
      <View style={styles.counterButtons}>
        <TouchableOpacity 
          style={[styles.counterButton, count <= min && styles.disabledButton]} 
          onPress={() => handleCounterChange(fieldName, -1)}
          disabled={count <= min}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity 
          style={[styles.counterButton, (travelers.adults + travelers.children) >= MAX_TRAVELERS && styles.disabledButton]}
          onPress={() => handleCounterChange(fieldName, 1)}
          disabled={(travelers.adults + travelers.children) >= MAX_TRAVELERS}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Traveler Options</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabin Class</Text>
          <View style={styles.classContainer}>
            {['Economy', 'PremiumEconomy', 'Business', 'First'].map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classButton,
                  travelers.cabinClass === cls && styles.activeClassButton
                ]}
                onPress={() => setTravelers(prev => ({ ...prev, cabinClass: cls }))}
              >
                <Text style={travelers.cabinClass === cls ? styles.activeClassText : styles.classText}>
                  {cls}
                </Text>
                {travelers.cabinClass === cls && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travelers</Text>
          <Text style={styles.travelerLimit}>
            {MAX_TRAVELERS - (travelers.adults + travelers.children)} seats remaining
          </Text>

          <View style={styles.travelerTypeContainer}>
            <TravelerCounter 
              type="Adults (12+ years)"
              count={travelers.adults}
              fieldName="adults"
              min={1}
            />
            <TravelerCounter 
              type="Children (2-11 years)"
              count={travelers.children}
              fieldName="children"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveAndExit}
          disabled={travelers.adults === 0}
        >
          <Text style={styles.saveButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { fontSize: 24, color: '#0066CC', marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  travelerLimit: { color: '#666', marginBottom: 16, fontSize: 14 },
  classContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  classButton: { width: '48%', padding: 16, borderWidth: 1, borderColor: '#e9ecef', borderRadius: 8, marginBottom: 12, alignItems: 'center', height: 60, position: 'relative' },
  activeClassButton: { borderColor: '#0066CC', backgroundColor: '#f0f8ff' },
  classText: { fontSize: 16, color: '#666' },
  activeClassText: { color: '#0066CC', fontWeight: '600' },
  selectedIndicator: { position: 'absolute', top: 4, right: 4, backgroundColor: '#0066CC', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  selectedIndicatorText: { color: '#fff', fontSize: 14 },
  counterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  counterLabel: { fontSize: 16, color: '#333', flex: 2 },
  ageHint: { fontSize: 12, color: '#868e96', marginTop: 4 },
  counterButtons: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  counterButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#e9ecef' },
  counterButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterValue: { width: 40, textAlign: 'center', fontSize: 16, color: '#333', fontWeight: '500' },
  saveButton: { backgroundColor: '#FF6D00', borderRadius: 8, padding: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default TravelerScreen;