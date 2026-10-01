// api.js
/*const BASE_URL = 'http://192.168.10.22/FinalYearProject/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/OneWayTrip?${queryString}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};*/
/*const BASE_URL = 'http://192.168.0.6/FinalYearProject/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    // Validate parameters
    if (!params.source || !params.destination || !params.departureDate) {
      throw new Error('Missing required parameters');
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${BASE_URL}/OneWayTrip?${queryString}`;
    
    console.log('API Request:', endpoint); // Log the request URL

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw new Error(error.message || 'Failed to connect to the server');
  }
};*/
// onewayapi.js
/*const BASE_URL = 'http://192.168.0.3/FinalYearProject/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    // Validate required parameters: source, destination, departureDate
    if (!params.source || !params.destination || !params.departureDate) {
      throw new Error('Missing required parameters: source, destination, or departureDate');
    }

    // Format departureDate to "YYYY-MM-DDTHH:mm:ss"
   const formattedDepartureDate = new Date(params.departureDate).toISOString().split('T')[0];


    // Prepare query parameters
    const queryParams = {
      source: params.source.trim(),
      destination: params.destination.trim(),
      departureDate: formattedDepartureDate,
      cabinClass: params.cabinClass || 'Economy',
      adults: params.adults || 1,
      seniors: params.seniors || 0,
      children: params.children || 0,
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `${BASE_URL}/OneWayTrip?${queryString}`;

    console.log('API Request:', endpoint);

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('No flights found in API response');
      return []; // Return empty array instead of throwing error
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    let errorMessage = 'Failed to search flights';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};*/

/*const BASE_URL = 'http://192.168.0.4/FinalYearProject/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    const {
      source,
      destination,
      departureDate,
      returnDate,      // Optional for one-way
      cabinClass = 'Economy',
      adults = 1,
      seniors = 0,
      children = 0,
      tripType = 'oneway' // "oneway" or "roundtrip"
    } = params;

    // Validate required fields
    if (!source || !destination || !departureDate) {
      throw new Error('Missing required parameters: source, destination, or departureDate');
    }

    if (tripType === 'roundtrip' && !returnDate) {
      throw new Error('Return date is required for round-trip search');
    }

    // Format dates
    const formattedDepartureDate = new Date(departureDate).toISOString().split('T')[0];
    const formattedReturnDate = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

    // Build query parameters
    const queryParams = {
      source: source.trim(),
      destination: destination.trim(),
      departureDate: formattedDepartureDate,
      cabinClass,
      adults,
    };

    if (tripType === 'roundtrip') {
      queryParams.returnDate = formattedReturnDate;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `${BASE_URL}/${tripType === 'roundtrip' ? 'RoundTrip' : 'OneWayTrip'}?${queryString}`;

    console.log('API Request:', endpoint);

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    let data = await response.json();
    console.log('API Response:', data);

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Remove FlightID and AirlineID if not needed
    const sanitizedData = data.map(({ FlightID, AirlineID, ...rest }) => rest);

    return sanitizedData;

  } catch (error) {
    console.error('API Error:', error);

    let errorMessage = 'Failed to search flights';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};*/
/*const BASE_URL = 'http://192.168.0.4/FinalYearProject/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    const {
      source,
      destination,
      departureDate,
      returnDate, // Optional for oneway
      cabinClass = 'Economy',
      adults = 1,
      seniors = 0,
      children = 0,
      tripType = 'oneway', // 'oneway', 'roundtrip', or 'multicity'
      segments = [] // For multi-city: [{ source, destination, departureDate, cabinClass }]
    } = params;

    // Common validation
    if (tripType !== 'multicity' && (!source || !destination || !departureDate)) {
      throw new Error('Missing required parameters: source, destination, or departureDate');
    }

    if (tripType === 'roundtrip' && !returnDate) {
      throw new Error('Return date is required for round-trip search');
    }

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let endpoint = '';

    if (tripType === 'multicity') {
      if (!Array.isArray(segments) || segments.length < 2) {
        throw new Error('At least two flight segments are required for a multi-city trip');
      }

      const multiParams = new URLSearchParams();

      segments.forEach(segment => {
        if (!segment.source || !segment.destination || !segment.departureDate) {
          throw new Error('Each multi-city segment must have source, destination, and departureDate');
        }

        const formattedDate = new Date(segment.departureDate).toISOString().split('T')[0];
        multiParams.append('sources', segment.source.trim());
        multiParams.append('destinations', segment.destination.trim());
        multiParams.append('departureDates', formattedDate);
        multiParams.append('cabinClasses', segment.cabinClass || 'Economy');
      });

      multiParams.append('adults', adults);
      multiParams.append('children', children);
      multiParams.append('seniors', seniors);

      endpoint = `${BASE_URL}/MultiCity?${multiParams.toString()}`;
    } else {
      // Handle oneway and roundtrip
      const formattedDepartureDate = new Date(departureDate).toISOString().split('T')[0];
      const formattedReturnDate = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

      const queryParams = {
        source: source.trim(),
        destination: destination.trim(),
        departureDate: formattedDepartureDate,
        cabinClass,
        adults,
        children,
        seniors,
      };

      if (tripType === 'roundtrip') {
        queryParams.returnDate = formattedReturnDate;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      endpoint = `${BASE_URL}/${tripType === 'roundtrip' ? 'RoundTrip' : 'OneWayTrip'}?${queryString}`;
    }

    console.log('API Request:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    let data = await response.json();
    console.log('API Response:', data);

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Remove FlightID and AirlineID if not needed
    const sanitizedData = data.map(({ FlightID, AirlineID, ...rest }) => rest);

    return sanitizedData;

  } catch (error) {
    console.error('API Error:', error);

    let errorMessage = 'Failed to search flights';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};*/
const BASE_URL = 'http://10.172.74.105/Task/api/FlightSearch';

export const searchFlights = async (params) => {
  try {
    const {
      source,
      destination,
      departureDate,
      returnDate,
      cabinClass = 'Economy',
      adults = 1,
      seniors = 0,
      children = 0,
      tripType = 'oneway',
      segments = [],
      flexDays = 0,
      
    } = params;

    
    if (tripType !== 'multicity' && (!source || !destination || !departureDate)) {
      throw new Error('Missing required parameters: source, destination, or departureDate');
    }

    if (tripType === 'roundtrip' && !returnDate) {
      throw new Error('Return date is required for round-trip search');
    }

   
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let endpoint = '';
    const totalPassengers = adults + children+seniors ;

    if (tripType === 'multicity') {
      if (!Array.isArray(segments) || segments.length < 2) {
        throw new Error('At least two flight segments are required for a multi-city trip');
      }

      const multiParams = new URLSearchParams();

      segments.forEach(segment => {
        if (!segment.source || !segment.destination || !segment.departureDate) {
          throw new Error('Each multi-city segment must have source, destination, and departureDate');
        }

        const formattedDate = new Date(segment.departureDate).toISOString().split('T')[0];
       multiParams.append('sources',segment.source.trim());
multiParams.append('destinations', segment.destination.trim());

        multiParams.append('departureDates',formattedDate );
        multiParams.append('cabinClasses', segment.cabinClass || 'Economy');
      });

      multiParams.append('adults', adults);
      multiParams.append('children', children);
      multiParams.append('seniors', seniors);

      endpoint = `${BASE_URL}/MultiCity?${multiParams.toString()}`;
    } else if (tripType === 'oneway') {

  const baseDate = new Date(departureDate);
  const formattedBaseDate = baseDate.toISOString().split('T')[0];

  if (flexDays > 0) {
   
    const dates = [];
    for (let i = -flexDays; i <= flexDays; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    const dateRange = dates.join(',');

    endpoint = `${BASE_URL}/OneWayTripFlex?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDates=${dateRange}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&departureFlex=${flexDays}`;
  } else {
    
    endpoint = `${BASE_URL}/OneWayTrip?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}`;
  }
} else if (tripType === 'roundtrip') {
  const baseDate = new Date(departureDate);
  const formattedBaseDate = baseDate.toISOString().split('T')[0];
  const formattedReturnDate = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

  if (flexDays > 0) {
    
    endpoint = `${BASE_URL}/RoundTripFlex?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&returnDate=${formattedReturnDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&departureFlex=${flexDays}&returnFlex=${flexDays}`;
  } else {
   
    endpoint = `${BASE_URL}/RoundTrip?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&returnDate=${formattedReturnDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}`;
  }
}

    console.log('API Request:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    let data = await response.json();
    console.log('API Response:', data);

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data;

  } catch (error) {
   
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to search flights';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};

//for direct flights only code
/*const BASE_URL = 'http://10.227.216.105/Task/api/DirectFlight';

export const searchFlights = async (params) => {
  try {
    const {
      source,
      destination,
      departureDate,
      returnDate,
      cabinClass = 'Economy',
      adults = 1,
      seniors = 0,
      children = 0,
      tripType = 'oneway',
      segments = [],
      flexDays = 0,
      directFlightsOnly = false, // Added directFlightsOnly parameter
    } = params;

    if (tripType !== 'multicity' && (!source || !destination || !departureDate)) {
      throw new Error('Missing required parameters: source, destination, or departureDate');
    }

    if (tripType === 'roundtrip' && !returnDate) {
      throw new Error('Return date is required for round-trip search');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let endpoint = '';
    const totalPassengers = adults + children + seniors;

    if (tripType === 'multicity') {
      if (!Array.isArray(segments) || segments.length < 2) {
        throw new Error('At least two flight segments are required for a multi-city trip');
      }

      const multiParams = new URLSearchParams();

      segments.forEach(segment => {
        if (!segment.source || !segment.destination || !segment.departureDate) {
          throw new Error('Each multi-city segment must have source, destination, and departureDate');
        }

        const formattedDate = new Date(segment.departureDate).toISOString().split('T')[0];
        multiParams.append('sources', segment.source.trim());
        multiParams.append('destinations', segment.destination.trim());
        multiParams.append('departureDates', formattedDate);
        multiParams.append('cabinClasses', segment.cabinClass || 'Economy');
      });

      multiParams.append('adults', adults);
      multiParams.append('children', children);
      multiParams.append('seniors', seniors);
      multiParams.append('directFlightsOnly', directFlightsOnly); // Added for multi-city

      endpoint = `${BASE_URL}/MultiCity?${multiParams.toString()}`;
    } else if (tripType === 'oneway') {
      const baseDate = new Date(departureDate);
      const formattedBaseDate = baseDate.toISOString().split('T')[0];

      if (flexDays > 0) {
        const dates = [];
        for (let i = -flexDays; i <= flexDays; i++) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        const dateRange = dates.join(',');

        endpoint = `${BASE_URL}/OneWayTripFlex?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDates=${dateRange}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&departureFlex=${flexDays}&directFlightsOnly=${directFlightsOnly}`;
      } else {
        endpoint = `${BASE_URL}/OneWayTrip?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&directFlightsOnly=${directFlightsOnly}`;
      }
    } else if (tripType === 'roundtrip') {
      const baseDate = new Date(departureDate);
      const formattedBaseDate = baseDate.toISOString().split('T')[0];
      const formattedReturnDate = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

      if (flexDays > 0) {
        endpoint = `${BASE_URL}/RoundTripFlex?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&returnDate=${formattedReturnDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&departureFlex=${flexDays}&returnFlex=${flexDays}&directFlightsOnly=${directFlightsOnly}`;
      } else {
        endpoint = `${BASE_URL}/RoundTrip?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departureDate=${formattedBaseDate}&returnDate=${formattedReturnDate}&cabinClass=${cabinClass}&adults=${adults}&children=${children}&seniors=${seniors}&directFlightsOnly=${directFlightsOnly}`;
      }
    }

    console.log('API Request:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    let data = await response.json();
    console.log('API Response:', data);

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data;

  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to search flights';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};*/