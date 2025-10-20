import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useSelector, useDispatch } from "react-redux"; 
import { selectCurrentToken, clearAuth } from "../features/auth/authSlice"; 

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const token = useSelector(selectCurrentToken);
    const dispatch = useDispatch(); 

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                    console.log("[AxiosPrivate:Request] Token Attached:", token ? token.substring(0, 20) + '...' : 'NONE'); 
                } 
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                const status = error?.response?.status;
                                
                if (status === 401 && !prevRequest?.sent) {
                    
                    console.warn("[AxiosPrivate:Response] 401 Unauthorized detected. Attempting token refresh.");                     
                    prevRequest.sent = true; 
                    try {
                        const newAccessToken = await refresh();
                        
                        console.log("[AxiosPrivate:Response] Token successfully refreshed. New Token:", newAccessToken ? newAccessToken.substring(0, 20) + '...' : 'ERROR'); // DEBUG
                        
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest); 
                    } catch (refreshError) {
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
