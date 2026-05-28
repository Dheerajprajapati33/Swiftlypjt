import axios from 'axios';
import { BASE_URL } from './api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;