import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import { selectCurrentToken, clearAuth } from "../features/auth/authSlice"; // Import clearAuth

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const token = useSelector(selectCurrentToken);
    const dispatch = useDispatch(); // Initialize useDispatch

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Attach Access Token only if it doesn't already exist (e.g., from a previous refresh attempt)
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                } 
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                const status = error?.response?.status;
                                
                // Check if it's a 401 Unauthorized error and hasn't been sent before (to prevent infinite loops)
                if (status === 401 && !prevRequest?.sent) {
                    
                    prevRequest.sent = true;
                    
                    try {
                        // 1. Attempt to get a new Access Token using the Refresh Token
                        const newAccessToken = await refresh();
                        
                        // 2. Update the original request with the new token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // 3. Re-send the original failed request
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        // CRITICAL FIX: If the refresh token exchange fails (e.g., Refresh Token is expired/invalid)
                        // Clear the Redux state to log the user out and trigger redirection via RequireAuth.jsx
                        dispatch(clearAuth());
                        
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [token, refresh, dispatch]) // Added dispatch to dependencies

    return axiosPrivate;
}

export default useAxiosPrivate;
