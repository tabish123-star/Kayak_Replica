
////////////
// SearchResultsScreen.js
import React, { useState, useEffect,useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';

const formatDateString = (date) => {
  if (!date) return '';
  try {
    if (date instanceof Date) return date.toISOString().split('T')[0];
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    if (typeof date === 'string' && date.includes('T')) return date.split('T')[0];
    return date;
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

const getFlexDateRange = (originalDate, flexDays) => {
  if (!originalDate || flexDays <= 0) return '';
  
  const baseDate = new Date(originalDate);
  if (isNaN(baseDate.getTime())) return '';
  
  const start = new Date(baseDate);
  start.setDate(start.getDate() - flexDays);
  
  const end = new Date(baseDate);
  end.setDate(end.getDate() + flexDays);
  
  return `${formatDateString(start)} to ${formatDateString(end)}`;
};

const getHourFromTimeString = (timeStr) => {
  if (!timeStr) return 0;
  
  const isNextDay = timeStr.includes('+1');
  const cleanTime = timeStr.replace(/\+\d+/, '').trim();
  
  const match = cleanTime.match(/(\d+):(\d+)/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return (isNextDay ? hours + 24 : hours) + minutes/60;
  }
  return 0;
};

const formatTime = (hour) => {
  const isNextDay = hour >= 24;
  const adjustedHour = hour >= 24 ? hour - 24 : hour;
  
  const hours = Math.floor(adjustedHour);
  const minutes = Math.round((adjustedHour - hours) * 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${isNextDay ? '+1' : ''}`;
};

const parseTimeRange = (timeRange) => {
  if (!timeRange) return { departureTime: '--', arrivalTime: '--' };
  const [departure, arrivalRaw] = timeRange.split(/–|-/).map(t => t.trim());
  const arrival = arrivalRaw.replace(/\+\d+/, '').trim();
  return {
    departureTime: departure || '--',
    arrivalTime: arrival || '--'
  };
};

const parseDuration = (duration) => {
  if (!duration) return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minsMatch ? parseInt(minsMatch[1]) : 0;
  return hours * 60 + minutes;
};

const SearchResultsScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const apiFlights = Array.isArray(params.flights) ? params.flights : [];
  const searchParams = params.searchParams || {};
  const error = params.error || null;
  
  const [isLoading, setIsLoading] = useState(true);
  const [originalFlights, setOriginalFlights] = useState([]);
  const [displayedFlights, setDisplayedFlights] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedSortOption, setSelectedSortOption] = useState('Best');
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [favorites, setFavorites] = useState([]);
  
  const [departureTimeRange, setDepartureTimeRange] = useState([0, 24]);
  const [departureLandingTimeRange, setDepartureLandingTimeRange] = useState([0, 24]);
  const [returnTimeRange, setReturnTimeRange] = useState([0, 24]);
  const [returnLandingTimeRange, setReturnLandingTimeRange] = useState([0, 24]);

  const filterOptions = ['Sort', 'Stops', 'Airline', 'Price','Time' ];
  const sortOptions = ['Best', 'Cheapest', 'Quickest', 'Earliest','Slowest','Earliest Takeoff'];
  const airlineOptions = ['Emirates', 'Turkish Airlines', 'Qatar Airways', 'SAUDIA', 'Fly Dubai', 'flynas', 'flyadeal', 'Pegasus Airlines', 'Ajet', 'Hahn Air'];
  const stopOptions = ['Non-stop', '1 stop', '2+ stops'];

  const isMultiCity = searchParams.tripType === 'multicity';
  const isRoundTrip = searchParams.returnDate !== undefined;

  const getStopCount = useCallback((stopString) => {
    if (!stopString) return 0;
    if (typeof stopString === 'number') return stopString;
    
    if (stopString.toLowerCase().includes('nonstop') || 
        stopString.toLowerCase().includes('non-stop') ||
        stopString === '0' || 
        stopString === '0 stops') {
      return 0;
    }
    
    const match = stopString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }, []);

  useEffect(() => {
    // Initialize with searchParams airlines if available
    if (searchParams.airlines) {
      setSelectedAirlines(searchParams.airlines);
    }
    
    // Handle flight load errors
    if (error === 'NO_FLIGHTS') {
      Alert.alert('No Flights', 'No flights found for your search criteria');
    } else if (error) {
      Alert.alert('Error', 'Failed to load flight data');
    }
    
    // Format flight data
    if (apiFlights.length > 0) {
      try {
        if (isMultiCity) {
          const formattedFlights = apiFlights.map(itinerary => {
            const legs = itinerary.legs.map(leg => {
              const times = parseTimeRange(leg.timeRange);
              return {
                ...leg,
                stopCount: getStopCount(leg.stops),
                rawDuration: parseDuration(leg.duration),
                departureHour: getHourFromTimeString(times.departureTime),
                landingHour: getHourFromTimeString(times.arrivalTime),
              };
            });

            return {
              id: legs.map(leg =>
                `${leg.source}-${leg.destination}-${leg.departureDate}-${leg.departureTime}`
              ).join('_') + `_${itinerary.rawTotalPrice}`,
              ...itinerary,
              legs,
              price: itinerary.rawTotalPrice || 0,
              rawTotalDuration: legs.reduce((sum, leg) => sum + leg.rawDuration, 0),
              flexInfo: {
                overall: searchParams.flexDays || 0,
              },
              originalDates: itinerary.legs.map(leg =>
                formatDateString(leg.originalDate || searchParams.startDate)
              ),
            };
          });

          setOriginalFlights(formattedFlights);
          setDisplayedFlights(formattedFlights);
        } else {
          const formattedFlights = apiFlights.map(flight => {
            const outboundTimes = parseTimeRange(flight.DepartureTime);
            const returnTimes = parseTimeRange(flight.ReturnTime);
            
            const departureFlex = searchParams.flexDays || 0;
            const returnFlex = flight.ReturnDate ? searchParams.flexDays || 0 : 0;
            
            const originalDepartureDate = searchParams.startDate || searchParams.departureDate;
            const originalReturnDate = searchParams.returnDate;
            
            const outboundDateDiff = flight.DepartureDate && 
                                    formatDateString(flight.DepartureDate) !== 
                                    formatDateString(originalDepartureDate);
            
            const returnDateDiff = flight.ReturnDate && 
                                  formatDateString(flight.ReturnDate) !== 
                                  formatDateString(originalReturnDate);

            return {
              id: `${flight.Source}-${flight.Destination}-${flight.DepartureDate}-${flight.DepartureTime}-${flight.Price}`,
              isRoundTrip: !!flight.ReturnDate,
              source: flight.Source,
              destination: flight.Destination,
              airline: flight.AirlineName,
              departureDate: formatDateString(flight.DepartureDate),
              returnDate: formatDateString(flight.ReturnDate),
              cabinClass: flight.CabinClass || searchParams.cabinClass,
              price: flight.Price || 0,
              rawTotalDuration: parseDuration(flight.TotalTime) + parseDuration(flight.ReturnTotalTime),
              
              flexInfo: {
                outbound: departureFlex,
                return: returnFlex,
                hasFlex: departureFlex > 0 || returnFlex > 0,
                outboundDateDiff,
                returnDateDiff
              },
              
              originalDates: {
                outbound: formatDateString(originalDepartureDate),
                return: formatDateString(originalReturnDate)
              },

              outbound: {
                route: `${flight.Source} → ${flight.Destination}`,
                airline: flight.AirlineName || 'Unknown Airline',
                departureTime: outboundTimes.departureTime,
                arrivalTime: outboundTimes.arrivalTime,
                duration: flight.TotalTime || '--',
                stops: flight.Stops || '0',
                stopAirports: flight.StopName || '',
                rawDuration: parseDuration(flight.TotalTime),
                stopCount: getStopCount(flight.Stops),
                departureDate: formatDateString(flight.DepartureDate),
                source: flight.Source,
                destination: flight.Destination,
                departureHour: getHourFromTimeString(outboundTimes.departureTime),
                landingHour: getHourFromTimeString(outboundTimes.arrivalTime),
              },

              return: {
                route: `${flight.Destination} → ${flight.Source}`,
                airline: flight.ReturnAirline || 'Unknown Airline',
                departureTime: returnTimes.departureTime,
                arrivalTime: returnTimes.arrivalTime,
                duration: flight.ReturnTotalTime || '--',
                stops: flight.ReturnStop || '0',
                stopAirports: flight.ReturnStopName || '',
                rawDuration: parseDuration(flight.ReturnTotalTime),
                stopCount: getStopCount(flight.ReturnStop),
                departureDate: formatDateString(flight.ReturnDate),
                source: flight.Destination,
                destination: flight.Source,
                departureHour: getHourFromTimeString(returnTimes.departureTime),
                landingHour: getHourFromTimeString(returnTimes.arrivalTime),
              },

              baggage: {
                carryOn: searchParams.baggage?.carryOn || 1,
                checked: searchParams.baggage?.checked || 1
              }
            };
          });
          setOriginalFlights(formattedFlights);
          setDisplayedFlights(formattedFlights);
        }
      } catch (e) {
        console.error('Error formatting flights:', e);
        Alert.alert('Error', 'Failed to process flight data');
      }
    }

    setIsLoading(false);
  }, [apiFlights, route.params?.flight, error, isMultiCity, getStopCount, searchParams]);

  useEffect(() => {
    if (originalFlights.length === 0) return;
    
    let results = [...originalFlights];
    
    // Apply price filter
    results = results.filter(flight => 
      flight.price >= priceRange[0] && flight.price <= priceRange[1]
    );
    
    // Apply airline filter
    if (selectedAirlines.length > 0) {
      if (isMultiCity) {
        results = results.filter(itinerary => 
          itinerary.legs.some(leg => 
            selectedAirlines.includes(leg.airline)
        ));
      } else {
        results = results.filter(flight => {
          const outboundMatch = selectedAirlines.includes(flight.outbound.airline);
          const returnMatch = flight.isRoundTrip 
            ? selectedAirlines.includes(flight.return.airline) 
            : true;
          return outboundMatch && returnMatch;
        });
      }
    }
    
    // Apply stops filter
    if (selectedStops.length > 0) {
      if (isMultiCity) {
        results = results.filter(itinerary => 
          itinerary.legs.every(leg => {
            const stops = leg.stopCount;
            return selectedStops.some(stop => {
              if (stop === 'Non-stop') return stops === 0;
              if (stop === '1 stop') return stops === 1;
              if (stop === '2+ stops') return stops >= 2;
              return true;
            });
          })
        );
      } else {
        results = results.filter(flight => {
          const outboundStops = flight.outbound.stopCount;
          const outboundMatch = selectedStops.some(stop => {
            if (stop === 'Non-stop') return outboundStops === 0;
            if (stop === '1 stop') return outboundStops === 1;
            if (stop === '2+ stops') return outboundStops >= 2;
            return true;
          });
          
          if (!flight.isRoundTrip) {
            return outboundMatch;
          }
          
          const returnStops = flight.return.stopCount;
          const returnMatch = selectedStops.some(stop => {
            if (stop === 'Non-stop') return returnStops === 0;
            if (stop === '1 stop') return returnStops === 1;
            if (stop === '2+ stops') return returnStops >= 2;
            return true;
          });
          
          return outboundMatch && returnMatch;
        });
      }
    }
    
    // Apply time filters
    const isTimeFilterActive = departureTimeRange[0] > 0 || departureTimeRange[1] < 24 || 
                              departureLandingTimeRange[0] > 0 || departureLandingTimeRange[1] < 24 ||
                              returnTimeRange[0] > 0 || returnTimeRange[1] < 24 ||
                              returnLandingTimeRange[0] > 0 || returnLandingTimeRange[1] < 24;
    
    if (isTimeFilterActive) {
      if (isMultiCity) {
        results = results.filter(itinerary => 
          itinerary.legs.every(leg => {
            const depMatch = leg.departureHour >= departureTimeRange[0] && 
                            leg.departureHour <= departureTimeRange[1];
            const landMatch = leg.landingHour >= departureLandingTimeRange[0] && 
                             leg.landingHour <= departureLandingTimeRange[1];
            return depMatch && landMatch;
          })
        );
      } else {
        results = results.filter(flight => {
          const outboundDepMatch = flight.outbound.departureHour >= departureTimeRange[0] && 
                                 flight.outbound.departureHour <= departureTimeRange[1];
          const outboundLandMatch = flight.outbound.landingHour >= departureLandingTimeRange[0] && 
                                  flight.outbound.landingHour <= departureLandingTimeRange[1];
          
          if (!flight.isRoundTrip) {
            return outboundDepMatch && outboundLandMatch;
          }
          
          const returnDepMatch = flight.return.departureHour >= returnTimeRange[0] && 
                               flight.return.departureHour <= returnTimeRange[1];
          const returnLandMatch = flight.return.landingHour >= returnLandingTimeRange[0] && 
                                flight.return.landingHour <= returnLandingTimeRange[1];
          
          return outboundDepMatch && outboundLandMatch && returnDepMatch && returnLandMatch;
        });
      }
    }
    
    // Apply sorting
    if (selectedSortOption === 'Cheapest') {
      results.sort((a, b) => a.price - b.price);
    }
    else if (selectedSortOption === 'Quickest') {
      const validDurations = results
        .map(f => isMultiCity ? f.rawTotalDuration : (f.rawTotalDuration || 0))
        .filter(d => typeof d === 'number');

      const minDuration = Math.min(...validDurations);

      results = results.filter(f => {
        const duration = isMultiCity ? f.rawTotalDuration : (f.rawTotalDuration || 0);
        return duration === minDuration;
      });
    }
    else if (selectedSortOption === 'Slowest') {
      const validDurations = results
        .map(f => isMultiCity ? f.rawTotalDuration : (f.rawTotalDuration || 0))
        .filter(d => typeof d === 'number');

      const maxDuration = Math.max(...validDurations);

      results = results.filter(f => {
        const duration = isMultiCity ? f.rawTotalDuration : (f.rawTotalDuration || 0);
        return duration === maxDuration;
      });
    }
    else if (selectedSortOption === 'Earliest') {
      if (isMultiCity) {
        const validFirstLegs = results
          .map(f => {
            const sortedLegs = f.legs?.slice().sort((a, b) => a.departureHour - b.departureHour);
            return sortedLegs?.[0]?.departureHour;
          })
          .filter(hour => typeof hour === 'number');

        const minHour = Math.min(...validFirstLegs);

        results = results.filter(f => {
          const sortedLegs = f.legs?.slice().sort((a, b) => a.departureHour - b.departureHour);
          return sortedLegs?.[0]?.departureHour === minHour;
        });
      } else {
        const validHours = results
          .map(f => f.outbound?.departureHour)
          .filter(hour => typeof hour === 'number');

        const minHour = Math.min(...validHours);

        results = results.filter(f => f.outbound?.departureHour === minHour);
      }
    }
    else if (selectedSortOption === 'Earliest Takeoff') {
      if (isMultiCity) {
        const allEarliestHours = results
          .map(f => {
            const legHours = f.legs?.map(leg => leg.departureHour).filter(h => typeof h === 'number');
            return legHours.length > 0 ? Math.min(...legHours) : null;
          })
          .filter(h => typeof h === 'number');

        const minHour = Math.min(...allEarliestHours);

        results = results.filter(f => {
          const legHours = f.legs?.map(leg => leg.departureHour).filter(h => typeof h === 'number');
          const earliestLegHour = legHours.length > 0 ? Math.min(...legHours) : null;
          return earliestLegHour === minHour;
        });
      } else {
        const validOutboundHours = results
          .map(f => f.outbound?.departureHour)
          .filter(hour => typeof hour === 'number');

        const minOutboundHour = Math.min(...validOutboundHours);

        results = results.filter(f => f.outbound?.departureHour === minOutboundHour);
      }
    }
    
    setDisplayedFlights(results);
  }, [
    selectedStops, 
    selectedAirlines, 
    selectedSortOption, 
    originalFlights, 
    isMultiCity,
    priceRange,
    departureTimeRange,
    departureLandingTimeRange,
    returnTimeRange,
    returnLandingTimeRange
  ]);

  const toggleFavorite = (flight) => {
    const isFavorite = favorites.some(fav => fav.id === flight.id);
    
   if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== flight.id));
      Alert.alert('Removed from Favorites', 'This flight has been removed from your favorites');
    } else {
      setFavorites([...favorites, flight]);
      Alert.alert('Added to Favorites', 'This flight has been added to your favorites');
    }
  };
  
  const navigateToFavorites = () => {
    navigation.navigate('FavoritesScreen', { favorites });
  };

  const toggleAirlineSelection = (airline) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) 
        ? prev.filter(item => item !== airline) 
        : [...prev, airline]
    );
  };

  const toggleStopSelection = (stop) => {
    setSelectedStops(prev => 
      prev.includes(stop) 
        ? prev.filter(item => item !== stop) 
        : [...prev, stop]
    );
  };

  const handleFilterPress = (filter) => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  const resetPriceFilter = () => {
    setPriceRange([0, 10000]);
  };

  const resetTimeFilters = () => {
    setDepartureTimeRange([0, 24]);
    setDepartureLandingTimeRange([0, 24]);
    setReturnTimeRange([0, 24]);
    setReturnLandingTimeRange([0, 24]);
  };

  const renderFilterDropdown = () => {
    if (!activeFilter) return null;

    const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < 10000;
    const isTimeFilterActive = departureTimeRange[0] > 0 || departureTimeRange[1] < 24 || 
                              departureLandingTimeRange[0] > 0 || departureLandingTimeRange[1] < 24 ||
                              returnTimeRange[0] > 0 || returnTimeRange[1] < 24 ||
                              returnLandingTimeRange[0] > 0 || returnLandingTimeRange[1] < 24;

    return (
      <View style={styles.filterDropdown}>
        {activeFilter === 'Sort' && sortOptions.map(option => (
          <TouchableOpacity 
            key={option}
            style={[styles.filterDropdownItem, selectedSortOption === option && styles.selectedFilterItem]}
            onPress={() => {
              setSelectedSortOption(option);
              setActiveFilter(null);
            }}
          >
            <Text style={styles.filterDropdownText}>{option}</Text>
            {selectedSortOption === option && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        {activeFilter === 'Stops' && stopOptions.map(stop => (
          <TouchableOpacity 
            key={stop}
            style={styles.filterDropdownItem}
            onPress={() => toggleStopSelection(stop)}
          >
            <View style={styles.checkboxContainer}>
              <View style={[styles.checkbox, selectedStops.includes(stop) && styles.checkedCheckbox]}>
                {selectedStops.includes(stop) && <Text style={styles.smallCheckmark}>✓</Text>}
              </View>
              <Text style={styles.filterDropdownText}>{stop}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {activeFilter === 'Airline' && airlineOptions.map(airline => (
          <TouchableOpacity 
            key={airline}
            style={styles.filterDropdownItem}
            onPress={() => toggleAirlineSelection(airline)}
          >
            <View style={styles.checkboxContainer}>
              <View style={[styles.checkbox, selectedAirlines.includes(airline) && styles.checkedCheckbox]}>
                {selectedAirlines.includes(airline) && <Text style={styles.smallCheckmark}>✓</Text>}
              </View>
              <Text style={styles.filterDropdownText}>{airline}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {activeFilter === 'Price' && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            </Text>
            <View style={styles.sliderValues}>
              <Text>${priceRange[0].toLocaleString()}</Text>
              <Text>${priceRange[1].toLocaleString()}</Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={10000}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#0066CC"
              step={100}
              value={priceRange[1]}
              onValueChange={value => {
                const min = priceRange[0];
                setPriceRange([min, Math.max(min, value)]);
              }}
              style={styles.slider}
            />
            <Slider
              minimumValue={0}
              maximumValue={10000}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#0066CC"
              step={100}
              value={priceRange[0]}
              onValueChange={value => {
                const max = priceRange[1];
                setPriceRange([Math.min(value, max), max]);
              }}
              style={styles.slider}
            />
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetPriceFilter}
            >
              <Text style={styles.resetButtonText}>Reset Price Filter</Text>
            </TouchableOpacity>
          </View>
        )}

      {activeFilter === 'Time' && (
        <View style={styles.filterDropdown}>
          <ScrollView style={styles.timeFilterScrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.timeSliderHeader}>Outbound Departure Time</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                {formatTime(departureTimeRange[0])} - {formatTime(departureTimeRange[1])}
              </Text>
              <View style={styles.sliderValues}>
                <Text>{formatTime(departureTimeRange[0])}</Text>
                <Text>{formatTime(departureTimeRange[1])}</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={24}
                step={0.5}
                value={departureTimeRange[1]}
                onValueChange={value => setDepartureTimeRange([departureTimeRange[0], value])}
                style={styles.slider}
                minimumTrackTintColor="#0066CC"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#0066CC"
              />
              <Slider
                minimumValue={0}
                maximumValue={24}
                step={0.5}
                value={departureTimeRange[0]}
                onValueChange={value => setDepartureTimeRange([value, departureTimeRange[1]])}
                style={styles.slider}
                minimumTrackTintColor="#0066CC"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#0066CC"
              />
            </View>

            <Text style={styles.timeSliderHeader}>Outbound Landing Time</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                {formatTime(departureLandingTimeRange[0])} - {formatTime(departureLandingTimeRange[1])}
              </Text>
              <View style={styles.sliderValues}>
                <Text>{formatTime(departureLandingTimeRange[0])}</Text>
                <Text>{formatTime(departureLandingTimeRange[1])}</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={24}
                step={0.5}
                value={departureLandingTimeRange[1]}
                onValueChange={value => setDepartureLandingTimeRange([departureLandingTimeRange[0], value])}
                style={styles.slider}
                minimumTrackTintColor="#0066CC"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#0066CC"
              />
              <Slider
                minimumValue={0}
                maximumValue={24}
                step={0.5}
                value={departureLandingTimeRange[0]}
                onValueChange={value => setDepartureLandingTimeRange([value, departureLandingTimeRange[1]])}
                style={styles.slider}
                minimumTrackTintColor="#0066CC"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#0066CC"
              />
            </View>

            {isRoundTrip && !isMultiCity && (
              <>
                <Text style={styles.timeSliderHeader}>Return Departure Time</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    {formatTime(returnTimeRange[0])} - {formatTime(returnTimeRange[1])}
                  </Text>
                  <View style={styles.sliderValues}>
                    <Text>{formatTime(returnTimeRange[0])}</Text>
                    <Text>{formatTime(returnTimeRange[1])}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={24}
                    step={0.5}
                    value={returnTimeRange[1]}
                    onValueChange={value => setReturnTimeRange([returnTimeRange[0], value])}
                    style={styles.slider}
                    minimumTrackTintColor="#0066CC"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#0066CC"
                  />
                  <Slider
                    minimumValue={0}
                    maximumValue={24}
                    step={0.5}
                    value={returnTimeRange[0]}
                    onValueChange={value => setReturnTimeRange([value, returnTimeRange[1]])}
                    style={styles.slider}
                    minimumTrackTintColor="#0066CC"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#0066CC"
                  />
                </View>

                <Text style={styles.timeSliderHeader}>Return Landing Time</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    {formatTime(returnLandingTimeRange[0])} - {formatTime(returnLandingTimeRange[1])}
                  </Text>
                  <View style={styles.sliderValues}>
                    <Text>{formatTime(returnLandingTimeRange[0])}</Text>
                    <Text>{formatTime(returnLandingTimeRange[1])}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={24}
                    step={0.5}
                    value={returnLandingTimeRange[1]}
                    onValueChange={value => setReturnLandingTimeRange([returnLandingTimeRange[0], value])}
                    style={styles.slider}
                    minimumTrackTintColor="#0066CC"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#0066CC"
                  />
                  <Slider
                    minimumValue={0}
                    maximumValue={24}
                    step={0.5}
                    value={returnLandingTimeRange[0]}
                    onValueChange={value => setReturnLandingTimeRange([value, returnLandingTimeRange[1]])}
                    style={styles.slider}
                    minimumTrackTintColor="#0066CC"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#0066CC"
                  />
                </View>
              </>
            )}

            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetTimeFilters}
            >
              <Text style={styles.resetButtonText}>Reset All Time Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

        {(activeFilter === 'Stops' || activeFilter === 'Airline') && (
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.filterActionButton}
              onPress={() => activeFilter === 'Stops' ? setSelectedStops([]) : setSelectedAirlines([])}
            >
              <Text style={styles.filterActionText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterActionButton, styles.applyButton]}
              onPress={() => setActiveFilter(null)}
            >
              <Text style={[styles.filterActionText, styles.applyButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFlightSegment = (segment, label, originalDate = null, flexDays = 0) => (
    <View style={styles.flightSegment}>
      {label && <Text style={styles.segmentLabel}>{label}</Text>}
      <View style={styles.flightHeader}>
       <Text style={styles.airlineText}>{segment.airline}</Text>
      </View>
      
      <View style={styles.flightDetails}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{segment.departureTime}</Text>
          <Text style={styles.dateText}>{segment.departureDate}</Text>
          {originalDate && segment.departureDate !== originalDate && (
            <Text style={styles.flexDateNote}>
              (Original: {originalDate})
            </Text>
          )}
          <Text style={styles.airportText}>{segment.source}</Text>
        </View>
        
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{segment.duration}</Text>
          <View style={styles.flightPath}>
            <View style={styles.pathDot} />
            <View style={styles.pathLine} />
            <View style={[styles.pathDot, styles.pathDotEnd]} />
          </View>
          <Text style={styles.stopsText}>
            {segment.stops === 0 ? 'Non-stop' : `${segment.stops} stop${segment.stops > 1 ? 's' : ''}`}
            {segment.stopAirports ? ` (${segment.stopAirports})` : ''}
          </Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{segment.arrivalTime}</Text>
          <Text style={styles.dateText}>
            {segment.arrivalTime?.includes('+1') ? 'Next day' : segment.departureDate}
          </Text>
          <Text style={styles.airportText}>{segment.destination}</Text>
        </View>
      </View>
    </View>
  );

  const renderFlightCard = (flight, index) => {
    const isFavorite = favorites.some(fav => fav.id === flight.id);
    
    return (
      <TouchableOpacity 
        key={`flight-${index}`}
        style={styles.flightCard}
        onPress={() => navigation.navigate('SearchResult', { flight, searchParams })}
      >
        <View style={styles.flightHeader}>
          <Text style={styles.priceText}>${flight.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(flight)}>
            <Icon 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite ? "#FF5252" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
        
        {renderFlightSegment(
          flight.outbound, 
          'Outbound', 
          flight.originalDates.outbound,
          flight.flexInfo.outbound
        )}
        
        {flight.isRoundTrip && renderFlightSegment(
          flight.return, 
          'Return', 
          flight.originalDates.return,
          flight.flexInfo.return
        )}
        
        {flight.flexInfo.hasFlex && (
          <View style={styles.flexInfoContainer}>
            <Text style={styles.flexInfoText}>
              Showing results with ±{flight.flexInfo.outbound} day(s) flexibility
            </Text>
            
            <View style={styles.dateRangeContainer}>
              <Text style={styles.dateRangeLabel}>Outbound range:</Text>
              <Text style={styles.dateRangeText}>
                {getFlexDateRange(flight.originalDates.outbound, flight.flexInfo.outbound)}
              </Text>
            </View>
            
            {flight.flexInfo.outboundDateDiff && (
              <View style={styles.dateComparison}>
                <Text style={styles.originalDateText}>
                  Original: {flight.originalDates.outbound}
                </Text>
                <Text style={styles.actualDateText}>
                  Actual: {flight.outbound.departureDate}
                </Text>
              </View>
            )}
            
            {flight.isRoundTrip && flight.flexInfo.return > 0 && (
              <>
                <View style={styles.dateRangeContainer}>
                  <Text style={styles.dateRangeLabel}>Return range:</Text>
                  <Text style={styles.dateRangeText}>
                    {getFlexDateRange(flight.originalDates.return, flight.flexInfo.return)}
                  </Text>
                </View>
                
                {flight.flexInfo.returnDateDiff && (
                  <View style={styles.dateComparison}>
                    <Text style={styles.originalDateText}>
                      Original: {flight.originalDates.return}
                    </Text>
                    <Text style={styles.actualDateText}>
                      Actual: {flight.return.departureDate}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
        
        <View style={styles.flightFooter}>
          <Text style={styles.cabinClassText}>Class: {flight.cabinClass}</Text>
          <Text style={styles.baggageText}>
            Bags: {flight.baggage.carryOn} carry-on, {flight.baggage.checked} checked
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMultiCityItinerary = (itinerary, index) => {
    const isFavorite = favorites.some(fav => fav.id === itinerary.id);
    
    return (
      <TouchableOpacity 
        key={`itinerary-${index}`} 
        style={styles.itineraryCard}
        onPress={() => navigation.navigate('SearchResult', { flight: itinerary, searchParams })}
      >
        <View style={styles.itineraryHeader}>
          <Text style={styles.priceText}>${itinerary.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(itinerary)}>
            <Icon 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite ? "#FF5252" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
        
        {itinerary.legs.map((leg, legIndex) => (
          <View key={`leg-${legIndex}`} style={styles.legContainer}>
            <Text style={styles.segmentLabel}>Segment {legIndex + 1}</Text>

            <View style={styles.timeRow}>
              <Text style={styles.timeRange}>{leg.departureTime} – {leg.arrivalTime}</Text>
              <Text style={styles.durationText}>{leg.duration}</Text>
            </View>

            <Text style={styles.airlineText}>{leg.airline}</Text>

            <View style={styles.stopsRow}>
              <Text style={styles.stopsText}>
                {leg.stops === 0 ? 'Non-stop' : `${leg.stops} stop${leg.stops > 1 ? 's' : ''}`}
              </Text>
              {leg.stopAirports && leg.stopAirports !== 'N/A' && (
                <Text style={styles.stopAirports}>
                  {leg.stopAirports}
                </Text>
              )}
            </View>

            <Text style={styles.routeText}>{leg.route}</Text>
            <Text style={styles.dateText}>
              {formatDateString(leg.departureDate)}
            </Text>
            
            {itinerary.flexInfo.overall > 0 && leg.departureDate !== itinerary.originalDates[legIndex] && (
              <View style={styles.dateComparison}>
                <Text style={styles.originalDateText}>
                  Original: {itinerary.originalDates[legIndex]}
                </Text>
                <Text style={styles.actualDateText}>
                  Actual: {formatDateString(leg.departureDate)}
                </Text>
              </View>
            )}
          </View>
        ))}

        {itinerary.flexInfo.overall > 0 && (
          <View style={styles.flexInfoContainer}>
            <Text style={styles.flexInfoText}>
              Showing results for ±{itinerary.flexInfo.overall} day{itinerary.flexInfo.overall > 1 ? 's' : ''} around selected dates
            </Text>
          </View>
        )}

        <View style={styles.itineraryFooter}>
          <Text style={styles.totalDurationText}>Total: {itinerary.totalDuration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading flights...</Text>
      </View>
    );
  }

  const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < 10000;
  const isTimeFilterActive = departureTimeRange[0] > 0 || departureTimeRange[1] < 24 || 
                            departureLandingTimeRange[0] > 0 || departureLandingTimeRange[1] < 24 ||
                            returnTimeRange[0] > 0 || returnTimeRange[1] < 24 ||
                            returnLandingTimeRange[0] > 0 || returnLandingTimeRange[1] < 24;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen', { preventSearch: true })}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity onPress={navigateToFavorites} style={styles.favoritesButton}>
          <Icon name="favorite" size={24} color="#FF5252" />
          {favorites.length > 0 && (
            <View style={styles.favoritesBadge}>
              <Text style={styles.favoritesCount}>{favorites.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error === 'NO_FLIGHTS' 
              ? 'No flights found for your search criteria' 
              : 'Error loading flight data'}
          </Text>
        </View>
      )}

      <View style={styles.filterContainer}>
        {filterOptions.map(option => (
          <TouchableOpacity 
            key={option}
            style={[
              styles.filterButton,
              activeFilter === option && styles.activeFilterButton,
              (option === 'Sort' && selectedSortOption !== 'Best') && styles.filterButtonSelected,
              (option === 'Stops' && selectedStops.length > 0) && styles.filterButtonSelected,
              (option === 'Airline' && selectedAirlines.length > 0) && styles.filterButtonSelected,
              (option === 'Price' && isPriceFilterActive) && styles.filterButtonSelected,
              (option === 'Time' && isTimeFilterActive) && styles.filterButtonSelected,
            ]}
            onPress={() => handleFilterPress(option)}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilter === option && styles.activeFilterText,
              (option === 'Sort' && selectedSortOption !== 'Best') && styles.selectedFilterText,
              (option === 'Stops' && selectedStops.length > 0) && styles.selectedFilterText,
              (option === 'Airline' && selectedAirlines.length > 0) && styles.selectedFilterText,
              (option === 'Price' && isPriceFilterActive) && styles.selectedFilterText,
              (option === 'Time' && isTimeFilterActive) && styles.selectedFilterText,
            ]}>
              {option}
              {option === 'Sort' && selectedSortOption !== 'Best' && `: ${selectedSortOption}`}
              {option === 'Stops' && selectedStops.length > 0 && ` (${selectedStops.length})`}
              {option === 'Airline' && selectedAirlines.length > 0 && ` (${selectedAirlines.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderFilterDropdown()}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {displayedFlights.length > 0 ? (
          isMultiCity ? (
            displayedFlights.map(renderMultiCityItinerary)
          ) : (
            displayedFlights.map(renderFlightCard)
          )
        ) : !error ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No flights available</Text>
            <Text style={styles.noResultsSubtext}>Please try different search criteria</Text>
          </View>
        ) : null}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.rateUsButton}
        onPress={() => navigation.navigate('RateUsScreen')}
      >
        <Text style={styles.rateUsButtonText}>Rate Us</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
    color: '#0066CC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  favoritesButton: {
    padding: 8,
    position: 'relative',
  },
  favoritesBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
    backgroundColor: '#f5f5f5',
  },
  activeFilterButton: {
    backgroundColor: '#0066CC',
  },
  filterButtonSelected: {
    backgroundColor: '#e6f2ff',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  selectedFilterText: {
    color: '#0066CC',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 500,
  },
  filterDropdownItem: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFilterItem: {
    backgroundColor: '#f5f5f5',
  },
  filterDropdownText: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  smallCheckmark: {
    color: '#fff',
    fontSize: 12,
  },
  checkmark: {
    color: '#0066CC',
    fontSize: 16,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  filterActionButton: {
    padding: 10,
  },
  filterActionText: {
    color: '#0066CC',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 4,
  },
  applyButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  flightCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itineraryCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  legContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeRange: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  airlineText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stopsText: {
    fontSize: 14,
    color: '#666',
  },
  stopAirports: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  routeText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  itineraryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
  },
  priceContainer: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  cabinClassText: {
    fontSize: 14,
    color: '#666',
  },
  totalDurationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  flightSegment: {
    marginBottom: 16,
  },
  segmentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    alignItems: 'center',
    width: '25%',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  airportText: {
    fontSize: 14,
    color: '#666',
  },
  durationContainer: {
    alignItems: 'center',
    width: '50%',
  },
  flightPath: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pathDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC',
    position: 'absolute',
    left: 0,
  },
  pathDotEnd: {
    left: 'auto',
    right: 0,
  },
  pathLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  stopsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  baggageText: {
    fontSize: 14,
    color: '#666',
  },
  flexInfoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  flexInfoText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  originalDateText: {
    fontSize: 12,
    color: '#888',
  },
  actualDateText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  dateComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  dateRangeLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 12,
    color: '#0066CC',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#0066CC',
  },
  flexDateNote: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  sliderContainer: {
    marginVertical: 10,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  sliderValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeSliderHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#0066CC',
    fontWeight: '500',
  },
  timeFilterScrollArea: {
    maxHeight: 400,
  },
  rateUsButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  rateUsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen;