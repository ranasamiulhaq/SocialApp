// useAxiosPrivate.js - CRITICAL FIX

import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useSelector } from "react-redux";
// FIX: Import the store and selector function
import { store } from "../app/store"; // Assuming store is in '../app/store' or adjust path
import { selectCurrentToken } from "../features/auth/authSlice";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    // We keep useSelector here only if we need it for other logic, 
    // but the interceptor will use store.getState()
    // const token = useSelector(selectCurrentToken); // Can be commented out/removed

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // FIX: Get the LATEST token directly from the Redux store on every request
                const token = selectCurrentToken(store.getState());

                // Only set the Authorization header if it's not already set (e.g., for retries)
                // AND the token is available.
                if (!config.headers['Authorization'] && token) { 
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    // FIX: Remove 'token' from the dependency array. 
    // The interceptor now reads the token directly from the store.
    }, [refresh]) 

    return axiosPrivate;
}

export default useAxiosPrivate;