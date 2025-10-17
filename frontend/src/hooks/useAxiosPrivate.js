// useAxiosPrivate.js - REVERTED TO STANDARD HOOK PATTERN

import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    // Use useSelector to get the token, which forces a re-run of useEffect when it changes.
    const token = useSelector(selectCurrentToken); 

    useEffect(() => {
        // DUBBING STATEMENT 1: Log when interceptors are REGISTERED/RE-REGISTERED
        console.log(`➡️ INTERCEPTORS: Registering with token: ${!!token}`);

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // We only set the Authorization header if it's not already present.
                // This ensures that the response interceptor's retry doesn't go through here
                // unless it explicitly forgot to set the header.
                if (!config.headers['Authorization']) {
                    console.log(`➡️ AXIOS REQUEST: Attaching token to request for ${config.url}. Token present: ${!!token}`);
                    config.headers['Authorization'] = `Bearer ${token}`;
                } else {
                    console.log(`♻️ AXIOS REQUEST: Header already set for retry to ${config.url}.`);
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                const status = error?.response?.status;
                
                // DUBBING STATEMENT 7: Log any error response status
                console.log(`🛑 AXIOS RESPONSE ERROR: Status ${status} for URL ${prevRequest?.url}.`);
                
                if (status === 401 && !prevRequest?.sent) {
                    console.log(`⚠️ 401 DETECTED: Attempting token refresh...`);
                    
                    prevRequest.sent = true;
                    
                    try {
                        const newAccessToken = await refresh();
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        console.log(`✅ REFRESH SUCCESS: Retrying request to ${prevRequest?.url} with new token.`);
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        console.error('❌ REFRESH FAILURE: Logging out user.', refreshError.response?.data || refreshError.message);
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            console.log('🧹 INTERCEPTORS: Ejecting old interceptors.');
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [token, refresh]) // Dependency on token is essential for updates

    return axiosPrivate;
}

export default useAxiosPrivate;