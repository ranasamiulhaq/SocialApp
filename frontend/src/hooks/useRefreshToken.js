import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setNewToken } from '../features/auth/authSlice';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            // Corrected to use POST to match your Laravel API route
            const response = await axios.post('/refresh', {}, {
                withCredentials: true
            });
            const newAccessToken = response.data.access_token;
            // DUBBING STATEMENT 11: Confirm new token received after refresh
            console.log('✅ REFRESH API CALL SUCCESS: New Access Token received, length:', newAccessToken.length);
            
            // Dispatching the new, correct action
            dispatch(setNewToken({ accessToken: newAccessToken }));
            return newAccessToken;
        } catch (err) {
            // DUBBING STATEMENT 12: Log refresh API call failure (e.g., bad cookie/expired refresh token)
            console.error('❌ REFRESH API CALL FAILED:', err.response?.data || err.message);
            throw err; // Re-throw the error so useAxiosPrivate can handle the logout
        }
    }
    return refresh;
};

export default useRefreshToken;