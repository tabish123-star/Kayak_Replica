/*import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FavoritesScreen = ({ navigation, route }) => {
  const favorites = route.params?.favorites || [];
  
  const renderFlightCard = (flight) => {
    const isRoundTrip = flight.isRoundTrip;
    
    return (
      <TouchableOpacity 
        key={flight.id}
        style={styles.card}
        onPress={() => navigation.navigate('SearchResult', { flight })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.price}>${flight.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Icon name="favorite" size={24} color="#FF5252" />
        </View>
        
        <View style={styles.routeContainer}>
          <Text style={styles.route}>
            {flight.outbound.source} → {flight.outbound.destination}
            {isRoundTrip ? ` → ${flight.outbound.source}` : ''}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{flight.outbound.departureDate}</Text>
          </View>
          {isRoundTrip && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Return</Text>
              <Text style={styles.detailValue}>{flight.return.departureDate}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Airline</Text>
            <Text style={styles.detailValue}>{flight.outbound.airline}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{flight.outbound.duration}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.footer}>
          <Text style={styles.classText}>Class: {flight.cabinClass}</Text>
          <Text style={styles.stopsText}>
            {flight.outbound.stops === 0 ? 'Non-stop' : `${flight.outbound.stops} stop(s)`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItineraryCard = (itinerary) => (
    <TouchableOpacity 
      key={itinerary.id}
      style={styles.card}
      onPress={() => navigation.navigate('SearchResult', { flight: itinerary })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.price}>${itinerary.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Icon name="favorite" size={24} color="#FF5252" />
      </View>
      
      <View style={styles.routeContainer}>
        <Text style={styles.route}>
          {itinerary.legs.map(leg => `${leg.source} → ${leg.destination}`).join(' → ')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Dates:</Text>
        <Text style={styles.detailValue}>
          {itinerary.legs.map(leg => leg.departureDate).join(', ')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total Duration:</Text>
        <Text style={styles.detailValue}>{itinerary.totalDuration}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.footer}>
        <Text style={styles.classText}>Class: {itinerary.cabinClass}</Text>
        <Text style={styles.stopsText}>
          {itinerary.legs.map(leg => 
            leg.stops === 0 ? 'Non-stop' : `${leg.stops} stop(s)`
          ).join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="favorite-border" size={80} color="#e0e0e0" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>Save flights by tapping the heart icon</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Search Results</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Favorite Flights</Text>
        <View style={styles.favoritesCountContainer}>
          <Text style={styles.favoritesCount}>{favorites.length}</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favorites.map(item => 
          item.legs ? renderItineraryCard(item) : renderFlightCard(item)
        )}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  favoritesCountContainer: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  favoritesCount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  routeContainer: {
    marginBottom: 12,
  },
  route: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classText: {
    fontSize: 14,
    color: '#666',
  },
  stopsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default FavoritesScreen;*/

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FavoritesScreen = ({ navigation, route }) => {
  const favorites = route.params?.favorites || [];

  const handleCardPress = (item) => {
    const flightData = item.legs
      ? { isMultiCity: true, ...item }
      : { isMultiCity: false, ...item };

    navigation.navigate('SearchResult', {
      flight: flightData,
      searchParams: item.searchParams || {}, // ✅ ensure searchParams is passed
    });
  };

  const renderFlightCard = (flight) => {
    const isRoundTrip = flight.isRoundTrip;

    return (
      <TouchableOpacity
        key={flight.id}
        style={styles.card}
        onPress={() => handleCardPress(flight)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.price}>
            ${flight.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Icon name="favorite" size={24} color="#FF5252" />
        </View>

        <View style={styles.routeContainer}>
          <Text style={styles.route}>
            {flight.outbound.source} → {flight.outbound.destination}
            {isRoundTrip ? ` → ${flight.outbound.source}` : ''}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{flight.outbound.departureDate}</Text>
          </View>
          {isRoundTrip && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Return</Text>
              <Text style={styles.detailValue}>{flight.return.departureDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Airline</Text>
            <Text style={styles.detailValue}>{flight.outbound.airline}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{flight.outbound.duration}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.classText}>Class: {flight.cabinClass}</Text>
          <Text style={styles.stopsText}>
            {flight.outbound.stops === 0 ? 'Non-stop' : `${flight.outbound.stops} stop(s)`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItineraryCard = (itinerary) => (
    <TouchableOpacity
      key={itinerary.id}
      style={styles.card}
      onPress={() => handleCardPress(itinerary)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.price}>
          ${itinerary.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Icon name="favorite" size={24} color="#FF5252" />
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.route}>
          {itinerary.legs.map((leg) => `${leg.source} → ${leg.destination}`).join(' → ')}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Dates:</Text>
        <Text style={styles.detailValue}>
          {itinerary.legs.map((leg) => leg.departureDate).join(', ')}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total Duration:</Text>
        <Text style={styles.detailValue}>{itinerary.totalDuration}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.classText}>Class: {itinerary.cabinClass}</Text>
        <Text style={styles.stopsText}>
          {itinerary.legs
            .map((leg) => (leg.stops === 0 ? 'Non-stop' : `${leg.stops} stop(s)`))
            .join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="favorite-border" size={80} color="#e0e0e0" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>Save flights by tapping the heart icon</Text>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 24 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Search Results</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Favorite Flights</Text>
        <View style={styles.favoritesCountContainer}>
          <Text style={styles.favoritesCount}>{favorites.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favorites.map((item) =>
          item.legs ? renderItineraryCard(item) : renderFlightCard(item)
        )}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  favoritesCountContainer: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  favoritesCount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  routeContainer: {
    marginBottom: 12,
  },
  route: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classText: {
    fontSize: 14,
    color: '#666',
  },
  stopsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default FavoritesScreen;
