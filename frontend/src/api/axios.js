import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
    headers: { 'Accept': 'application/json' },
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Accept': 'application/json' },
    withCredentials: true,
});