import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setNewToken } from '../features/auth/authSlice';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            const response = await axios.post('/refresh', {}, {
                withCredentials: true
            });
            const newAccessToken = response.data.access_token;
            dispatch(setNewToken({ accessToken: newAccessToken }));
            return newAccessToken;
        } catch (err) {
            throw err;
        }
    }
    return refresh;
};

export default useRefreshToken;