import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setNewToken } from '../features/auth/authSlice';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            console.log("[useRefreshToken] Attempting POST to /refresh endpoint...");
            const response = await axios.post('/refresh', {}, {
                withCredentials: true
            });
            const newAccessToken = response.data.access_token;
            console.log("[useRefreshToken] Refresh successful. New access token received.");
            dispatch(setNewToken({ accessToken: newAccessToken }));
            return newAccessToken;
        } catch (err) {
            console.error("[useRefreshToken] Refresh API call failed.", err.response?.data || err.message); 
            throw err;
        }
    }
    return refresh;
};

export default useRefreshToken;
