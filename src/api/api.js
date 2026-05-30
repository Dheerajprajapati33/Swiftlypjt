import { Platform } from 'react-native';

// Your live deployed Render backend URL
const LIVE_BACKEND_URL = 'https://swiftly-backend-5k7a.onrender.com';

export const BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api')
  : `${LIVE_BACKEND_URL}/api`;