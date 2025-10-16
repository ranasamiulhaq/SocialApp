import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setNewToken } from '../features/auth/authSlice';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        // Corrected to use POST to match your Laravel API route
        const response = await axios.post('/refresh', {}, {
            withCredentials: true
        });
        const newAccessToken = response.data.access_token;
        // Dispatching the new, correct action
        dispatch(setNewToken({ accessToken: newAccessToken }));
        return newAccessToken;
    }
    return refresh;
};

export default useRefreshToken;

