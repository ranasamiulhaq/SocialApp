import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import { selectCurrentToken, clearAuth } from "../features/auth/authSlice"; // Import clearAuth

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const token = useSelector(selectCurrentToken);
    const dispatch = useDispatch(); 

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Attach Access Token only if it doesn't already exist (e.g., from a previous refresh attempt)
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                    console.log("[AxiosPrivate:Request] Token Attached:", token ? token.substring(0, 20) + '...' : 'NONE'); // DEBUG
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
                    
                    console.warn("[AxiosPrivate:Response] 401 Unauthorized detected. Attempting token refresh."); // DEBUG
                    
                    prevRequest.sent = true; // Mark as sent to prevent re-entry
                    
                    try {
                        // 1. Attempt to get a new Access Token using the Refresh Token
                        const newAccessToken = await refresh();
                        
                        console.log("[AxiosPrivate:Response] Token successfully refreshed. New Token:", newAccessToken ? newAccessToken.substring(0, 20) + '...' : 'ERROR'); // DEBUG
                        
                        // 2. Update the original request with the new token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // 3. Instead of returning axiosPrivate(prevRequest), we let the interceptor 
                        //    finish and rely on the Redux state change (setNewToken) to trigger 
                        //    the re-send. This prevents a race condition.
                        return axiosPrivate(prevRequest); // We re-send it here to ensure the data is returned to the original component
                    } catch (refreshError) {
                        // If the refresh token exchange fails, log the user out!
                        console.error("[AxiosPrivate:Response] Token refresh FAILED. Logging out user.", refreshError.response || refreshError.message); // DEBUG
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
    }, [token, refresh, dispatch]) 

    return axiosPrivate;
}

export default useAxiosPrivate;
