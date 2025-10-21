import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setNewToken } from '../features/auth/authSlice';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            console.log("[useRefreshToken] Attempting POST to /refresh endpoint...");
            console.log("[useRefreshToken] Using withCredentials to send cookies");
            
            const response = await axios.post('/refresh', {}, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const newAccessToken = response.data.access_token;
            
            if (!newAccessToken) {
                console.error("[useRefreshToken] No access token in response");
                throw new Error('No access token received');
            }
            
            console.log("[useRefreshToken] Refresh successful. New access token received:", 
                newAccessToken.substring(0, 20) + '...');
            
            dispatch(setNewToken({ accessToken: newAccessToken }));
            return newAccessToken;
        } catch (err) {
            console.error("[useRefreshToken] Refresh API call failed");
            console.error("[useRefreshToken] Status:", err.response?.status);
            console.error("[useRefreshToken] Data:", err.response?.data);
            console.error("[useRefreshToken] Message:", err.message);
            throw err;
        }
    }
    return refresh;
};

export default useRefreshToken;