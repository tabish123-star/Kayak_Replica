// FlightSearchScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { searchFlights } from './onewayapi';
//import FrequentVisitsScreen from './finalproject/Screens/pratice';
import MostFrequentVisitsScreen from './finalproject/Screens/Tasks';
import RecommendationsScreen from './finalproject/Screens/newtasks';

const API_BASE_URL = 'http://10.172.74.105/Task/api/SearchHistory/Save';

const FlightSearchScreen = ({ navigation, route }) => {
  const [tripType, setTripType] = useState(route.params?.tripType || 'oneWay');
  const [fromLocation, setFromLocation] = useState(route.params?.fromLocation || '');
  const [toLocation, setToLocation] = useState(route.params?.toLocation || '');
  const [selectedDate, setSelectedDate] = useState(
    route.params?.selectedDate ? new Date(Number(route.params.selectedDate)) : new Date()
  );
  //number convert into year format 
  const [returnDate, setReturnDate] = useState(
    route.params?.returnDate ? new Date(route.params.returnDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [flexDays, setFlexDays] = useState(route.params?.flexDays || 0);
  const [cabinClass, setCabinClass] = useState(route.params?.cabinClass || 'Business');
  const [adults, setAdults] = useState(route.params?.adults || 1);
  const [children, setChildren] = useState(route.params?.children || 1);
  const [showBaggageModal, setShowBaggageModal] = useState(false);
  const [carryOnCount, setCarryOnCount] = useState(route.params?.carryOnCount || 1);
  const [checkedBagCount, setCheckedBagCount] = useState(route.params?.checkedBagCount || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showCabinModal, setShowCabinModal] = useState(false);
  const [currentCabinIndex, setCurrentCabinIndex] = useState(0);
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [showAirlineModal, setShowAirlineModal] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState(route.params?.selectedAirlines || []);
  const [trip,settrip]=useState(false)
  const[slectedtrip,setselectedtrip]=useState(route.params?.slectedtrip|| [])
  const [currentAirlineIndex, setCurrentAirlineIndex] = useState(0);
  const skipSearchRef = useRef(false);

  const [segments, setSegments] = useState(
    route.params?.segments?.map(s => ({
      ...s,
      date: new Date(s.date),
      selectedAirlines: s.selectedAirlines || []
    })) || [
      { 
        from: 'Lahore', 
        to: 'Riyadh', 
        date: new Date(),
        cabinClass: 'Business',
        selectedAirlines: []
      }
    ]
  );

  const airlinesList = [
    'Emirates',
    'Qatar Airways',
    'Fly Jinnah',
    'Cathay Pacific',
    'Lufthansa',
    'flydubai',
    'Turkish Airlines',
    'Etihad Airways',
    'Qantas',
    'Saudia',
    'airblue',
    'Pakistan International Airlines'
  ];
    const options = [
    'Job Search',
    'Vaccations',
    'Friends',
    'Family',
    'Relegious',
    
  ];
//convert date into year format e.g 2025-08-28
  const formatDateForAPI = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  useFocusEffect(
    useCallback(() => {
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
        return;
      } 

      if (route.params?.preventSearch) {
        skipSearchRef.current = true;
        navigation.setParams({ preventSearch: undefined });
        return;
      }

      if (route.params) {
        if (route.params.tripType) setTripType(route.params.tripType);
        if (route.params.fromLocation) setFromLocation(route.params.fromLocation);
        if (route.params.toLocation) setToLocation(route.params.toLocation);
        if (route.params.selectedDate) setSelectedDate(new Date(Number(route.params.selectedDate)));
        if (route.params.returnDate) setReturnDate(new Date(route.params.returnDate));
        if (route.params.flexDays) setFlexDays(route.params.flexDays);
        if (route.params.cabinClass) setCabinClass(route.params.cabinClass);
        if (route.params.adults) setAdults(route.params.adults);
        if (route.params.children) setChildren(route.params.children);
        if (route.params.carryOnCount) setCarryOnCount(route.params.carryOnCount);
        if (route.params.checkedBagCount) setCheckedBagCount(route.params.checkedBagCount);
        if (route.params.selectedAirlines) setSelectedAirlines(route.params.selectedAirlines);
        if(route.params.slectedtrip) setselectedtrip(route.params.slectedtrip)
        if (route.params.segments) {
          setSegments(route.params.segments.map(s => ({
            ...s,
            date: new Date(s.date),
            selectedAirlines: s.selectedAirlines || []
          })));
        }
      }
    }, [route.params, navigation])
  );

  const saveStateToParams = () => {
    navigation.setParams({
      tripType,
      fromLocation,
      toLocation,
      selectedDate: selectedDate.getTime(),
      returnDate: returnDate.getTime(),
      flexDays,
      cabinClass,
      adults,
      children,
      carryOnCount,
      checkedBagCount,
      selectedAirlines,
      slectedtrip,
      segments: segments.map(s => ({
        ...s,
        date: s.date.getTime(),
        selectedAirlines: s.selectedAirlines || []
      }))
    });
  };

  const getTripTypeForApi = () => {
    return tripType === 'oneWay' ? 'oneway' 
      : tripType === 'roundTrip' ? 'roundtrip'
      : 'multicity';
  };

  useEffect(() => {
    if (route.params?.updatedTravelers) {
      const { adults, children, cabinClass } = route.params.updatedTravelers;
      setAdults(adults);
      setChildren(children);
      setCabinClass(cabinClass);
    }
  }, [route.params?.updatedTravelers]);

  const formatDisplayDate = (date) => {
    return date instanceof Date ? date.toISOString().split('T')[0] : '';
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };
//seperate departure and arrival time
  const parseTimeRange = (timeRangeStr) => {
    if (!timeRangeStr) return { departureTime: '', arrivalTime: '' };
    
    // Handle format like "10:00 - 14:30"
    const parts = timeRangeStr.split(' - ');
    return {
      departureTime: parts[0] || '',
      arrivalTime: parts[1] || ''
    };
  };

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    
    // Handle format like "2h 30m"
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minutesMatch = durationStr.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
  };

  const showReturnDatepicker = () => {
    setShowReturnDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleReturnDateChange = (event, selectedDate) => {
    setShowReturnDatePicker(false);
    if (selectedDate) {
      setReturnDate(selectedDate);
    }
  };

  const saveSearchHistory = async (searchType, legs) => {
    try {
      const UserID = await AsyncStorage.getItem('UserID');
      if (!UserID) return;

      const searchData = {
        UserID: parseInt(UserID),
        SearchType: searchType,
        Airline: selectedAirlines.join(','),
        SearchLegs: legs.map(leg => ({
          Source: leg.Source,
          Destination: leg.Destination,
          DepartureDate: leg.DepartureDate,
          CabinClass: leg.CabinClass,
          Adults: leg.Adults,
          Children: leg.Children,
          Airline: selectedAirlines.join(','),
          ReturnDate: leg.ReturnDate
        }))
      };

      const response = await axios.post(API_BASE_URL, searchData);
      console.log('Search history saved:', response.data);
    } catch (error) {
      console.error('Error saving search history:', error.response?.data || error.message);
    }
  };

  const handleDefaultFamily = async () => {
    try {
      const userId = await AsyncStorage.getItem('UserID');
      if (!userId) {
        Alert.alert('Not Logged In', 'Please log in first.');
        return;
      }

      const response = await axios.get(`http://10.172.74.105/Task/api/SearchHistory/GetLatestFamily?userId=${userId}`);
      const { Adults, Children,CabinClass } = response.data;

      setAdults(Adults);
      setChildren(Children);
      setCabinClass(CabinClass)
      console.log('Populated from Default Family:', Adults, Children,CabinClass);
    } catch (error) {
      console.error('Error fetching default family:', error);
      Alert.alert('Error', 'Could not load default traveler data.');
    }
  };

  const getMaxTravel = async () => {
    try {
      const userId = await AsyncStorage.getItem('UserID');
      if (!userId) {
        Alert.alert('Not Logged In', 'Please log in first.');
        return;
      }

      const response = await axios.get(
        `http://172.26.62.105/Task/api/praticetask/GetMAXFamily/${userId}`
      );

      const { Adults, Children } = response.data;

      setAdults(Adults);
      setChildren(Children);

      console.log('Populated from Default Family:', Adults, Children);
    } catch (error) {
      console.error('Error fetching default family:', error);
      Alert.alert('Error', 'Could not load default traveler data.');
    }
  };

  const handleRegularTravel = async () => {
    try {
      const userId = await AsyncStorage.getItem('UserID');
      if (!userId) {
        Alert.alert('Not Logged In', 'Please log in first.');
        return;
      }

      const response = await axios.get(`http://172.26.62.105/Task/api/SearchHistory/GetRegularTravel/${userId}`);
      const data = response.data;

      setTripType(data.SearchType);
      setFromLocation(data.Source);
      setToLocation(data.Destination);
      setSelectedDate(new Date(data.DepartureDate));
      setCabinClass(data.CabinClass);
      setAdults(data.Adults);
      setChildren(data.Children);

      Alert.alert('Fields auto-filled from regular travel history');
    } catch (error) {
      Alert.alert(
        "No Regular Travel Found",
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.Message || error?.message || "Search more to activate."
      );
    }
  };

  const handledestination = async () => {
    try {
      const userId = await AsyncStorage.getItem('UserID');
      if (!userId) {
        Alert.alert('Not Logged In', 'Please log in first.');
        return;
      }

      const response = await axios.get(`http://10.172.74.105/Task/api/SearchHistory/GetRegularTravel/${userId}`);
      const data = response.data;

      if (!data || !data.Destination) {
        Alert.alert("No Regular Travel Found", "Search more to activate.");
        return;
      }

      setToLocation(data.Destination);
      Alert.alert('Regular Travel', `Destination auto-filled as "${data.Destination}"`);
    } catch (error) {
      Alert.alert(
        "No Regular Travel Found",
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.Message || error?.message || "Search more to activate."
      );
    }
  };

/* const fetchDestinations = async () => {
  try {
    const userId = await AsyncStorage.getItem("UserID");

    if (!userId) {
      Alert.alert("Error", "No User ID found in storage.");
      return;
    }

    const res = await axios.get(
      `http://10.227.216.105/Task/api/pratice/MostSearchedDestinations?userId=${userId}`
    );

    if (res.data && res.data.length > 0) {
      setToLocation(res.data);
    } else {
      Alert.alert("Info", "No destinations found.");
    }
  } catch (err) {
    if (err.response) {
      // backend returned a response (404, 500, etc.)
      Alert.alert("Error", err.response.data || "Request failed.");
    } else {
      // network or other issue
      Alert.alert("Error", err.message || "Failed to fetch destinations.");
    }
  }
};
*/
  //handle most frequent source,destination and departure date
const handleFrequentTravel = async () => {
  try {
    const userId = await AsyncStorage.getItem('UserID');
    if (!userId) {
      Alert.alert('Not Logged In', 'Please log in first.');
      return;
    }

    // Call your new API
    const response = await axios.get(
      `http://172.26.62.105/Task/api/SearchHistory/GetMostFrequentTravel/${userId}`
    );

    const data = response.data;

    if (!data || !data.Source || !data.Destination || !data.DepartureDate) {
      Alert.alert("No Frequent Travel Found", "Search more to activate.");
      return;
    }

    // Set values in your form
    setFromLocation(data.Source);
    setToLocation(data.Destination);
    setDepartureDate(new Date(data.DepartureDate));

    Alert.alert(
      'Frequent Travel Loaded',
      `Auto-filled as:\nSource: ${data.Source}\nDestination: ${data.Destination}\nDeparture: ${data.DepartureDate}`
    );
  } catch (error) {
    Alert.alert(
      "No Frequent Travel Found",
      typeof error?.response?.data === 'string'
        ? error.response.data
        : error?.response?.data?.Message || error?.message || "Search more to activate."
    );
  }
};
const handleDestination = async () => {
  try {
    const userId = await AsyncStorage.getItem("UserID");
    if (!userId) {
      Alert.alert("Not Logged In", "Please log in first.");
      return;
    }

    const response = await axios.get(
      `http://10.188.29.105/Task/api/pratice/GetMostSearchedDestinations/${userId}`
    );

    let data = response.data;

    // Handle case where API returns array
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    if (!data || !data.Destination) {
      Alert.alert("No Regular Travel Found", "Search more to activate.");
      return;
    }

    setToLocation(data.Destination);
    Alert.alert("Regular Travel", `Destination auto-filled as "${data.Destination}"`);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

/*const handleRegularAirline = async () => {
  try {
    const userId = await AsyncStorage.getItem("UserID");
    console.log("UserID from storage:", userId); // ✅ Debug log
    if (!userId) {
      Alert.alert("Not Logged In", "Please log in first.");
      return;
    }

    const url = `http://10.188.29.105/Task/api/pratice/GetRegularTravelAirline/${userId}`;
    console.log("Calling API:", url); // ✅ Debug log

    const response = await axios.get(url);
    console.log("Response:", response.data); // ✅ Debug log

    const data = response.data;

    if (!data || !data.Airline) {
      Alert.alert("No Regular Airline", "Search more flights to activate.");
      return;
    }

    setSelectedAirline(data.Airline);

    Alert.alert("Regular Airline Found", `Airline auto-filled as "${data.Airline}"`);
  } catch (error) {
    console.log("Error fetching airline:", error); // ✅ Debug log
    Alert.alert("Error", error.message);
  }
};*/


  const handleRecommendation = async () => {
    try {
      const userId = await AsyncStorage.getItem("UserID");
      if (!userId) {
        Alert.alert("Not Logged In", "Please log in first.");
        return;
      }

      const response = await fetch(`http://10.172.74.105/Task/api/SearchHistory/GetVacation/${userId}`);
      if (!response.ok) {
        const message = await response.text();
        Alert.alert("Suggestion Error", message || "No suggestion found.");
        return;
      }

      const data = await response.json();
      console.log("Auto-filled data:", data);

      // Process airline data to array format
      let recommendedAirlines = [];
      if (data.Airline) {
        if (Array.isArray(data.Airline)) {
          recommendedAirlines = data.Airline;
        } else if (typeof data.Airline === 'string') {
          recommendedAirlines = data.Airline.split(',').map(a => a.trim()).filter(a => a);
        }
      }

      setTripType(data.SearchType);
      setFromLocation(data.Source);
      setToLocation(data.Destination);
      setCabinClass(data.CabinClass || "Economy");
      setAdults(data.Adults || 1);
      setChildren(data.Children || 0);
      setSelectedAirlines(recommendedAirlines);

      // Handle departure date
      const parsedDeparture = new Date(data.DepartureDate);
      if (!isNaN(parsedDeparture)) {
        setSelectedDate(parsedDeparture);
      } else {
        setSelectedDate(new Date());
      }

      // Handle return date with fallback
      if (data.SearchType === "Roundtrip" && data.ReturnDate) {
        const parsedReturn = new Date(data.ReturnDate);
        if (!isNaN(parsedReturn)) {
          setReturnDate(parsedReturn);
        }
      } else {
        // fallback: 7 days after departure
        const fallbackReturn = new Date(parsedDeparture);
        fallbackReturn.setDate(fallbackReturn.getDate() + 1);
        setReturnDate(fallbackReturn);
      }

      Alert.alert("Suggestion Applied", "Fields have been autofilled for your next vacation!");
    } catch (error) {
      Alert.alert("Error", "Could not fetch vacation suggestion.");
      console.error("Vacation Suggestion Error:", error);
    }
  };

  const handledeparturedate = async () => {
  try {
    const userId = await AsyncStorage.getItem('UserID');
    if (!userId) {
      Alert.alert('Not Logged In', 'Please log in first.');
      return;
    }

    const response = await axios.get(
      `http://172.26.62.105/Task/api/praticetask/Getfrequentdeparturedate/${userId}`
    );

    const data = response.data;

    if (!data || !data.DepartureDate) {
      Alert.alert("No Regular Travel Found", "Search more to activate.");
      return;
    }

    // Fill input fields automatically
    setFromLocation(data.Source);
    setToLocation(data.Destination);
    setSelectedDate(new Date(data.DepartureDate));

    Alert.alert(
      "Regular Travel",
      `Auto-filled with Source: ${data.Source}, Destination: ${data.Destination}, Date: ${data.DepartureDate}`
    );
  } catch (error) {
    Alert.alert(
      "No Regular Travel Found",
      typeof error?.response?.data === "string"
        ? error.response.data
        : error?.response?.data?.Message ||
          error?.message ||
          "Search more to activate."
    );
  }
};

  const toggleAirline = (airline, index = null) => {
    if (tripType === 'multicity' && index !== null) {
      // For multi-city, update airlines for the specific segment
      setSegments(prev => {
        const newSegments = [...prev];
        const segmentAirlines = newSegments[index].selectedAirlines || [];
        
        if (segmentAirlines.includes(airline)) {
          newSegments[index].selectedAirlines = segmentAirlines.filter(a => a !== airline);
        } else {
          newSegments[index].selectedAirlines = [...segmentAirlines, airline];
        }
        
        return newSegments;
      });
    } else if (tripType === 'roundTrip') {
      // For round-trip, update airlines for the specific leg
      setSelectedAirlines(prev => {
        if (prev.includes(airline)) {
          return prev.filter(a => a !== airline);
        } else {
          return [...prev, airline];
        }
      });
    } else {
      // For one-way, update global airlines
      setSelectedAirlines(prev => {
        if (prev.includes(airline)) {
          return prev.filter(a => a !== airline);
        } else {
          return [...prev, airline];
        }
      });
    }
  };

  const getCurrentAirlines = (index = null) => {
    if (tripType === 'multicity' && index !== null) {
      return segments[index].selectedAirlines || [];
    } else {
      return selectedAirlines;
    }
  };

  const handleSearch = async () => {
    const tripTypeForApi = getTripTypeForApi();
    if (tripTypeForApi !== 'multicity') {
      if (!fromLocation || !toLocation) {
        setErrorMessage('Please enter both departure and arrival locations');
        Alert.alert('Missing Fields', 'Please enter both departure and arrival cities.');
        return;
      }
    } else {
      const invalidSegment = segments.find((segment, index) => {
        if (!segment.from || !segment.to) {
          setErrorMessage('Please fill all segments');
          return true;
        }

        if (new Date(segment.date) < new Date()) {
          setErrorMessage('Dates must be in the future');
          return true;
        }

        const nextSegment = segments[index + 1];
        if (nextSegment && segment.to !== nextSegment.from) {
          setErrorMessage('Arrival city must match next departure city');
          return true;
        }

        return false;
      });

      if (invalidSegment) {
        Alert.alert('Invalid Itinerary', errorMessage || 'Please check your segments');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const searchType = 
        tripType === 'oneWay' ? 'One-way' :
        tripType === 'roundTrip' ? 'Round-trip' : 'Multi-city';

      const legsForDb = [];
      
      if (tripTypeForApi === 'multicity') {
        segments.forEach((segment, index) => {
          legsForDb.push({
            Source: segment.from.split(',')[0].trim(),
            Destination: segment.to.split(',')[0].trim(),
            DepartureDate: formatDateForAPI(segment.date),
            CabinClass: segment.cabinClass,
            Adults: adults,
            Children: children,
            ReturnDate: formatDateForAPI(segment.date),
            Airline: (segment.selectedAirlines || []).join(',')
          });
        });
      } else {
        legsForDb.push({
          Source: fromLocation.split(',')[0].trim(),
          Destination: toLocation.split(',')[0].trim(),
          DepartureDate: formatDateForAPI(selectedDate),
          CabinClass: cabinClass,
          Adults: adults,
          Children: children,
          ReturnDate: tripTypeForApi === 'roundtrip' 
            ? formatDateForAPI(returnDate) 
            : formatDateForAPI(selectedDate),
          Airline: selectedAirlines.join(',')
        });
      }

      saveSearchHistory(searchType, legsForDb);
     
      const apiParams = {
        tripType: tripTypeForApi,
        cabinClass,
        adults,
        children,
        flexDays,
      };

      if (tripTypeForApi === 'multicity') {
        apiParams.segments = segments.map(segment => ({
          source: segment.from.split(',')[0].trim(),
          destination: segment.to.split(',')[0].trim(),
          departureDate: formatDateForAPI(segment.date),
          cabinClass: segment.cabinClass,
          airlines: segment.selectedAirlines || []
        }));
      } else {
        apiParams.source = fromLocation.split(',')[0].trim();
        apiParams.destination = toLocation.split(',')[0].trim();
        apiParams.departureDate = formatDateForAPI(selectedDate);
        apiParams.airlines = selectedAirlines;

        if (tripTypeForApi === 'roundtrip') {
          apiParams.returnDate = formatDateForAPI(returnDate);
        }
      }

      const results = await searchFlights(apiParams);

      if (!results || results.length === 0) {
        Alert.alert('No Flights Found', 'We couldn\'t find any matching flights. Please try different search criteria.');

        navigation.navigate('SearchResult', {
          flights: [],
          searchParams: {
            tripType: tripTypeForApi,
            ...(tripTypeForApi === 'multicity'
              ? { segments: segments.map(s => ({ ...s, date: formatDisplayDate(s.date) })) }
              : {
                fromLocation,
                toLocation,
                startDate: formatDisplayDate(selectedDate),
                returnDate: tripTypeForApi === 'roundtrip' ? formatDisplayDate(returnDate) : null,
                flexDays,
              }),
            adults,
            cabinClass,
            airlines: tripTypeForApi === 'multicity' 
              ? segments.map(s => s.selectedAirlines || []) 
              : selectedAirlines,
            baggage: {
              carryOn: carryOnCount,
              checked: checkedBagCount,
            },
          },
          error: 'NO_FLIGHTS',
        });
        return;
      }

      const resultData = {
        searchParams: {
          tripType: tripTypeForApi,
          adults,
          cabinClass,
          airlines: tripTypeForApi === 'multicity' 
            ? segments.map(s => s.selectedAirlines || []) 
            : selectedAirlines,
          baggage: {
            carryOn: carryOnCount,
            checked: checkedBagCount,
          },
          flexDays, 
        },
        flights: [],
        error: null,
      };

      if (tripTypeForApi === 'multicity') {
        const segmentsMap = {};
        segments.forEach((segment, index) => {
          segmentsMap[index] = [];
        });

        results.forEach(flight => {
          const segmentIndex = segments.findIndex(seg => 
            seg.from.split(',')[0].trim() === flight.Source &&
            seg.to.split(',')[0].trim() === flight.Destination &&
            formatDateForAPI(seg.date) === flight.DepartureDate.split('T')[0] &&
            seg.cabinClass.toLowerCase() === flight.CabinClass.toLowerCase()
          );
          
          if (segmentIndex !== -1) {
            segmentsMap[segmentIndex].push(flight);
          }
        });

        const minSegmentLength = Math.min(...Object.values(segmentsMap).map(arr => arr.length));
        const finalItineraries = [];

        for (let i = 0; i < minSegmentLength; i++) {
          const itineraryLegs = [];
          
          segments.forEach((_, index) => {
            if (segmentsMap[index][i]) {
              const flight = segmentsMap[index][i];
              const times = parseTimeRange(flight.DepartureTime);
              
              itineraryLegs.push({
                source: flight.Source,
                destination: flight.Destination,
                route: `${flight.Source} → ${flight.Destination}`,
                departureDate: flight.DepartureDate,
                airline: flight.AirlineName,
                departureTime: times.departureTime,
                arrivalTime: times.arrivalTime,
                duration: flight.TotalTime,
                stops: flight.Stops,
                stopAirports: flight.StopName,
                rawDuration: parseDuration(flight.TotalTime),
                price: flight.Price,
                cabinClass: flight.CabinClass
              });
            }
          });

          if (itineraryLegs.length === segments.length) {
            const totalPrice = itineraryLegs.reduce((sum, leg) => sum + leg.price, 0);
            const totalDuration = itineraryLegs.reduce((sum, leg) => sum + leg.rawDuration, 0);
            
            finalItineraries.push({
              legs: itineraryLegs,
              totalPrice: `$${totalPrice.toFixed(2)}`,
              totalDuration: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
              rawTotalPrice: totalPrice,
              rawTotalDuration: totalDuration,
              cabinClass: itineraryLegs[0].cabinClass,
              baggage: {
                carryOn: carryOnCount,
                checked: checkedBagCount,
              },
              flexDays,
            });
          }
        }

        resultData.flights = finalItineraries;
        resultData.searchParams.segments = segments.map(s => ({
          from: s.from,
          to: s.to,
          date: formatDisplayDate(s.date),
          cabinClass: s.cabinClass,
          selectedAirlines: s.selectedAirlines || []
        }));
      } else {
        resultData.flights = results.map(flight => ({
          ...flight,
          baggage: {
            carryOn: carryOnCount,
            checked: checkedBagCount,
          },
          originalDepartureDate: formatDisplayDate(selectedDate),
          originalReturnDate: tripTypeForApi === 'roundtrip' ? formatDisplayDate(returnDate) : null,
          flexDays, 
        }));

        resultData.searchParams = {
          ...resultData.searchParams,
          fromLocation,
          toLocation,
          startDate: formatDisplayDate(selectedDate),
          returnDate: tripTypeForApi === 'roundtrip' ? formatDisplayDate(returnDate) : null,
        };
      }

      navigation.navigate('SearchResult', resultData);
    } catch (error) {
      console.error('Search error:', error);

      let errorMessage = 'An error occurred while searching. Please try again.';
      if (error.message.includes('Required parameters')) {
        errorMessage = 'Please fill all required fields';
      } else if (error.message.includes('connection') || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('multi-city')) {
        errorMessage = 'Multi-city trips require at least 2 segments';
      }

      Alert.alert('Search Failed', errorMessage);

      navigation.navigate('SearchResult', {
        flights: [],
        searchParams: {
          tripType: tripTypeForApi,
          ...(tripTypeForApi === 'multicity'
            ? { segments: segments.map(s => ({ ...s, date: formatDisplayDate(s.date) })) }
            : {
              fromLocation,
              toLocation,
              startDate: formatDisplayDate(selectedDate),
              returnDate: tripTypeForApi === 'roundtrip' ? formatDisplayDate(returnDate) : null,
              flexDays,
            }),
          adults,
          cabinClass,
          airlines: tripTypeForApi === 'multicity' 
            ? segments.map(s => s.selectedAirlines || []) 
            : selectedAirlines,
          baggage: {
            carryOn: carryOnCount,
            checked: checkedBagCount,
          },
        },
        error: error.message || 'API_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSegment = () => {
    if (segments.length < 6) {
      setSegments([
        ...segments,
        { 
          from: segments[segments.length - 1].to,
          to: '', 
          date: new Date(),
          cabinClass: segments[segments.length - 1].cabinClass,
          selectedAirlines: [...segments[segments.length - 1].selectedAirlines]
        }
      ]);
    }
  };

  const removeSegment = (index) => {
    if (segments.length > 1) {
      const newSegments = [...segments];
      newSegments.splice(index, 1);
      setSegments(newSegments);
    }
  };

  const updateSegment = (index, field, value) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const handleCabinClassChange = (cabin) => {
    if (tripType === 'multicity') {
      const newSegments = [...segments];
      newSegments[currentCabinIndex].cabinClass = cabin;
      setSegments(newSegments);
    } else {
      setCabinClass(cabin);
    }
    setShowCabinModal(false);
  };

  const handleFlexDaysSelect = (days) => {
    setFlexDays(days);
    setShowFlexModal(false);
  };

  const renderMultiCityForm = () => {
    return segments.map((segment, index) => (
      <View key={index} style={styles.segmentContainer}>
        {index > 0 && (
          <TouchableOpacity 
            style={styles.removeSegmentButton}
            onPress={() => removeSegment(index)}
          >
            <Text style={styles.removeSegmentText}>Remove</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.label}>From</Text>
        <TextInput
          style={styles.input}
          value={segment.from}
          onChangeText={(text) => updateSegment(index, 'from', text)}
          placeholder="Enter departure city"
        />
        
        <Text style={styles.label}>To</Text>
        <TextInput
          style={styles.input}
          value={segment.to}
          onChangeText={(text) => updateSegment(index, 'to', text)}
          placeholder="Enter arrival city"
        />
        
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => {
            setCurrentSegmentIndex(index);
            setShowDatePicker(true);
          }}
        >
          <Text>{formatDisplayDate(segment.date)}</Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>Cabin Class</Text>
        <TouchableOpacity 
          style={styles.cabinClassButton}
          onPress={() => {
            setCurrentCabinIndex(index);
            setShowCabinModal(true);
          }}
        >
          <Text>{segment.cabinClass}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Airlines (Optional)</Text>
        <TouchableOpacity 
          style={styles.airlineButton}
          onPress={() => {
            setCurrentAirlineIndex(index);
            setShowAirlineModal(true);
          }}
        >
          <Text style={styles.airlineButtonText}>
            {segment.selectedAirlines && segment.selectedAirlines.length > 0 
              ? `Airlines: ${segment.selectedAirlines.join(', ')}` 
              : 'Select Airlines (Optional)'}
          </Text>
        </TouchableOpacity>

         <Text style={styles.label}>Trips </Text>
        <TouchableOpacity 
          style={styles.airlineButton}
          onPress={() => {
            setCurrentAirlineIndex(index);
            setselectedtrip(true);
          }}
        >
          <Text style={styles.airlineButtonText}>
            {segment.selectedAirlines && segment.selectedAirlines.length > 0 
              ? `Airlines: ${segment.selectedAirlines.join(', ')}` 
              : 'Select Airlines (Optional)'}
          </Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const renderRoundTripAirlines = () => {
    return (
      <View>
        <Text style={styles.label}>Airlines (Optional)</Text>
        <TouchableOpacity 
          style={styles.airlineButton}
          onPress={() => {
            setCurrentAirlineIndex(-1); // -1 indicates round-trip airlines
            setShowAirlineModal(true);
          }}
        >
          <Text style={styles.airlineButtonText}>
            {selectedAirlines.length > 0 
              ? `Airlines: ${selectedAirlines.join(', ')}` 
              : 'Select Airlines (Optional)'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOneWayAirlines = () => {
    return (
      <View>
        <Text style={styles.label}>Airlines (Optional)</Text>
        <TouchableOpacity 
          style={styles.airlineButton}
          onPress={() => {
            setCurrentAirlineIndex(-2); // -2 indicates one-way airlines
            setShowAirlineModal(true);
          }}
        >
          <Text style={styles.airlineButtonText}>
            {selectedAirlines.length > 0 
              ? `Airlines: ${selectedAirlines.join(', ')}` 
              : 'Select Airlines (Optional)'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const cabinClasses = [
    { id: 'Economy', name: 'Economy' },
    { id: 'Premium', name: 'PremiumEconomy' },
    { id: 'Business', name: 'Business Class' },
    { id: 'First', name: 'First Class' }
  ];

  const flexOptions = [
    { days: 0, label: 'No flexibility' },
    { days: 1, label: '±1 day' },
    { days: 2, label: '±2 days' },
    { days: 3, label: '±3 days' },
    { days: 4, label: '±4 days' },
    { days: 5, label: '±5 days' },
  ];

  const hasMixedCabins = segments.some(
    segment => segment.cabinClass !== segments[0].cabinClass
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6D00" />
          <Text style={styles.loadingText}>Searching for flights...</Text>
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.flightsTitle}>Flights</Text>
        
        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'oneWay' && styles.activeTripType
            ]}
            onPress={() => setTripType('oneWay')}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'oneWay' && styles.activeTripTypeText
            ]}>One Way</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'roundTrip' && styles.activeTripType
            ]}
            onPress={() => setTripType('roundTrip')}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'roundTrip' && styles.activeTripTypeText
            ]}>Round Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'multicity' && styles.activeTripType
            ]}
            onPress={() => setTripType('multicity')}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'multicity' && styles.activeTripTypeText
            ]}>Multi City</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'defaultFamily' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType('defaultFamily');
             // handleRegularAirline
              handleDefaultFamily();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'defaultFamily' && styles.activeTripTypeText
            ]}>Default Family</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'RegularTravlers' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType('RegularTravlers');
              //fetchDestinations()
              handledestination();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'RegularTravlers' && styles.activeTripTypeText
            ]}>RegularTravlers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'Vaccations' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType('Vaccations');
              handleRecommendation();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'Vaccations' && styles.activeTripTypeText
            ]}>Vaccations</Text>
          </TouchableOpacity>
            <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'movetonext' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType(navigation.navigate('Data'));
             // handleRegularAirline
              //handleDefaultFamily();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'Data' && styles.activeTripTypeText
            ]}>Next</Text>
          </TouchableOpacity>
           <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'Data' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType(navigation.navigate('RecommendationsScreen'));
             // handleRegularAirline
              //handleDefaultFamily();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'Data' && styles.activeTripTypeText
            ]}>Data</Text>
          </TouchableOpacity>
<Text style={[
              styles.tripTypeText,
              tripType === 'Data' && styles.activeTripTypeText
            ]}>Next</Text>
        
          
        </View>

        {tripType !== 'multicity' ? (
          <View style={styles.locationContainer}>
            <Text style={styles.label}>From</Text>
            <TextInput
              style={styles.input}
              value={fromLocation}
              onChangeText={setFromLocation}
              placeholder="Enter departure city"
            />
            
            <Text style={styles.label}>To</Text>
            <TextInput
              style={styles.input}
              value={toLocation}
              onChangeText={setToLocation}
              placeholder="Enter arrival city"
            />
            
            <Text style={styles.label}>
              {tripType === 'roundTrip' ? 'Departure Date' : 'Date'}
            </Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={showDatepicker}
            >
              <Text>{formatDisplayDate(selectedDate)}</Text>
            </TouchableOpacity>
            
            {tripType === 'roundTrip' && (
              <>
                <Text style={styles.label}>Return Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={showReturnDatepicker}
                >
                  <Text>{formatDisplayDate(returnDate)}</Text>
                </TouchableOpacity>
              </>
            )}
            
            <Text style={styles.label}>Flexible Dates</Text>
            <TouchableOpacity 
              style={styles.flexSelector}
              onPress={() => setShowFlexModal(true)}
            >
              <Text>
                {flexDays === 0 
                  ? 'No flexibility' 
                  : `±${flexDays} day${flexDays > 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>

            {tripType === 'roundTrip' ? renderRoundTripAirlines() : renderOneWayAirlines()}
          </View>
        ) : (
          <View style={styles.multiCityContainer}>
            {renderMultiCityForm()}
            
            {segments.length < 6 && (
              <TouchableOpacity 
                style={styles.addSegmentButton}
                onPress={addSegment}
              >
                <Text style={styles.addSegmentText}>+ Add Another Flight</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.travelerInput}
          onPress={() => {
            navigation.navigate('TravelerScreen', {
              initialValues: {
                adults,
                children,
                cabinClass,
              },
              currentState: {
                tripType,
                fromLocation,
                toLocation,
                selectedDate: selectedDate.getTime(),
                returnDate: returnDate.getTime(),
                flexDays,
                cabinClass,
                adults,
                children,
                carryOnCount,
                checkedBagCount,
                selectedAirlines,
                segments: segments.map(s => ({
                  ...s,
                  date: s.date.getTime(),
                  selectedAirlines: s.selectedAirlines || []
                }))
              }
            });
          }}
        >
          <Text style={styles.label}>Traveler</Text>
          <Text style={styles.travelerValue}>
            {`${adults + children} traveler, ${
              tripType === 'multicity' && hasMixedCabins ? 'Multiple Classes' : cabinClass
            }${flexDays > 0 ? `, ±${flexDays} day flex` : ''}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowBaggageModal(true)}>
          <Text style={styles.baggageText}>Baggage</Text>
        </TouchableOpacity>
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={tripType === 'multicity' 
            ? segments[currentSegmentIndex]?.date || new Date() 
            : selectedDate
          }
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            if (date) {
              if (tripType === 'multicity') {
                const newSegments = [...segments];
                newSegments[currentSegmentIndex].date = date;
                setSegments(newSegments);
              } else {
                setSelectedDate(date);
              }
            }
            setShowDatePicker(false);
          }}
        />
      )}

      {showReturnDatePicker && (
        <DateTimePicker
          value={returnDate}
          mode="date"
          display="default"
          minimumDate={selectedDate}
          onChange={handleReturnDateChange}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showBaggageModal}
        onRequestClose={() => setShowBaggageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Baggage</Text>

            <View style={styles.baggageOptionContainer}>
              <Text style={styles.baggageOptionText}>Carry-on bag</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[
                    styles.counterButton, 
                    carryOnCount === 0 && { backgroundColor: '#ccc' }
                  ]} 
                  onPress={() => setCarryOnCount(Math.max(0, carryOnCount - 1))}
                  disabled={carryOnCount === 0}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{carryOnCount}</Text>

                <TouchableOpacity 
                  style={[
                    styles.counterButton, 
                    carryOnCount >= 1 && { backgroundColor: '#ccc' }
                  ]} 
                  onPress={() => setCarryOnCount(carryOnCount + 1)}
                  disabled={carryOnCount >= 1}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.baggageOptionContainer}>
              <Text style={styles.baggageOptionText}>Checked bag</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[
                    styles.counterButton, 
                    checkedBagCount === 0 && { backgroundColor: '#ccc' }
                  ]} 
                  onPress={() => setCheckedBagCount(Math.max(0, checkedBagCount - 1))}
                  disabled={checkedBagCount === 0}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{checkedBagCount}</Text>

                <TouchableOpacity 
                  style={[
                    styles.counterButton, 
                    checkedBagCount >= 2 && { backgroundColor: '#ccc' }
                  ]} 
                  onPress={() => setCheckedBagCount(checkedBagCount + 1)}
                  disabled={checkedBagCount >= 2}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowBaggageModal(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAirlineModal}
        onRequestClose={() => setShowAirlineModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tripType === 'multicity' 
                ? `Select Airlines for Segment ${currentAirlineIndex + 1}`
                : 'Select Airlines'}
            </Text>
            
            {airlinesList.map((airline) => (
              <TouchableOpacity
                key={airline}
                style={styles.airlineOption}
                onPress={() => {
                  if (tripType === 'multicity') {
                    toggleAirline(airline, currentAirlineIndex);
                  } else {
                    toggleAirline(airline);
                  }
                }}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    getCurrentAirlines(
                      tripType === 'multicity' ? currentAirlineIndex : null
                    ).includes(airline) && styles.checked
                  ]}>
                    {getCurrentAirlines(
                      tripType === 'multicity' ? currentAirlineIndex : null
                    ).includes(airline) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.airlineOptionText}>{airline}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowAirlineModal(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
            

           
          </View>
        </View>
      </Modal>
<Modal
        animationType="slide"
        transparent={true}
        visible={trip}
        onRequestClose={() => settrip(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tripType === 'multicity' 
                ? `Select Airlines for Segment ${currentAirlineIndex + 1}`
                : 'Select Airlines'}
            </Text>
            
            {airlinesList.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.airlineOption}
                onPress={() => {
                  if (tripType === 'multicity') {
                    toggleAirline(option, currentAirlineIndex);
                  } else {
                    toggleAirline(option);
                  }
                }}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    getCurrentAirlines(
                      tripType === 'multicity' ? currentAirlineIndex : null
                    ).includes(option) && styles.checked
                  ]}>
                    {getCurrentAirlines(
                      tripType === 'multicity' ? currentAirlineIndex : null
                    ).includes(option) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.airlineOptionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => settrip(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
            

           
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCabinModal}
        onRequestClose={() => setShowCabinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Cabin Class</Text>
            
            {cabinClasses.map((cabin) => (
              <TouchableOpacity
                key={cabin.id}
                style={styles.cabinOption}
                onPress={() => handleCabinClassChange(cabin.id)}
              >
                <Text style={styles.cabinOptionText}>{cabin.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowCabinModal(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFlexModal}
        onRequestClose={() => setShowFlexModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Flexibility</Text>
            
            {flexOptions.map((option) => (
              <TouchableOpacity
                key={option.days}
                style={[
                  styles.flexOption,
                  flexDays === option.days && styles.selectedFlexOption
                ]}
                onPress={() => handleFlexDaysSelect(option.days)}
              >
                <Text style={styles.flexOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowFlexModal(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  flightsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    justifyContent: 'center',
  },
  flexSelector: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 15,
  },
  cabinClassButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    justifyContent: 'center',
  },
  airlineButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 15,
  },
  airlineButtonText: {
    color: '#333',
  },
  travelerInput: {
    marginBottom: 15,
  },
  travelerValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  baggageText: {
    color: '#FF6D00',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#FF6D00',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 5,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6D00',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  baggageOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  baggageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tripTypeButton: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    borderRadius: 8,
  },
  activeTripType: {
    backgroundColor: '#FF6D00',
  },
  tripTypeText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
  activeTripTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  multiCityContainer: {
    marginBottom: 20,
  },
  segmentContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  removeSegmentButton: {
    alignSelf: 'flex-end',
    padding: 6,
    marginBottom: 8,
  },
  removeSegmentText: {
    color: '#FF0000',
    fontSize: 14,
  },
  addSegmentButton: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addSegmentText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  cabinOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  cabinOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  flexOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  selectedFlexOption: {
    backgroundColor: '#e3f2fd',
  },
  flexOptionText: {
    fontSize: 16,
    color: '#333',
  },
  airlineOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  airlineOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlightSearchScreen;

/*
 <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === 'getmaxtravel' && styles.activeTripType
            ]}
            onPress={() => {
              setTripType('getmaxtravel');
              getMaxTravel();
            }}
          >
            <Text style={[
              styles.tripTypeText,
              tripType === 'getmaxtravel' && styles.activeTripTypeText
            ]}>MAXTRAVEL</Text>
          </TouchableOpacity>*/