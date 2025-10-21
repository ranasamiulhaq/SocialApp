import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

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