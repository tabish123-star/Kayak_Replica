// LoginApi.js
/*import axios from 'axios';
const API_URL = 'http://192.168.0.4/praticeproject/api/User/CreateUser';
class LoginApi {
  static async createUser(email, password) {
    try {
      const response = await axios.post(API_URL, {
        Email: email,
        Password: password,
      });

      return response.data;
    } catch (error) {
      console.error('Create user error:', error);

      if (error.response) {
        throw new Error(`Server error: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('No response from server. Backend may be unreachable.');
      } else {
        throw new Error('Request error: ' + error.message);
      }
    }
  }
}

export default LoginApi;*/
/*import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.188.29.105/Task/api/User/CreateUser';

class LoginApi {
  static async createUser(email, password) {
    try {
      const response = await axios.post(API_URL, {
        Email: email,
        Password: password,
        
      });

      // Save UserID to AsyncStorage upon successful login
      if (response.data && response.data.UserID) {
        await AsyncStorage.setItem('UserID', response.data.UserID.toString());
      }

      return response.data;
    } catch (error) {
      console.error('Create user error:', error);

      if (error.response) {
        throw new Error(`Server error: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('No response from server. Backend may be unreachable.');
      } else {
        throw new Error('Request error: ' + error.message);
      }
    }
  }
}

export default LoginApi;*/
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREATE_URL = 'http://10.172.74.105/Task/api/Users/CreateUser';
const GET_BY_EMAIL_URL = 'http://10.227.216.105/Task/api/User/GetUserByEmail'; // new endpoint

class LoginApi {
  static async createUser(email, password) {
    const response = await axios.post(CREATE_URL, {
      Email: email,
      Password: password,
    });

    if (response.data && response.data.UserID) {
      await AsyncStorage.setItem('UserID', response.data.UserID.toString());
    }
    return response.data;
  }

  static async checkUserByEmail(email) {
    try {
      const response = await axios.get(`${GET_BY_EMAIL_URL}/${email}`);
      if (response.data && response.data.UserID) {
        await AsyncStorage.setItem('UserID', response.data.UserID.toString());
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('User not found, please sign up first.');
      }
      throw new Error('Error checking user');
    }
  }
}

export default LoginApi;

