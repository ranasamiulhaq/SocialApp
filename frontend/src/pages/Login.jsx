import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

// Import Redux hooks and actions
import { useDispatch } from 'react-redux';
import { setAuth } from '../features/auth/authSlice';

const LOGIN_URL = '/login';

const Login = () => {
    // Get the dispatch function from Redux
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard"; // Navigate to dashboard on success

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(LOGIN_URL, { email, password });
            const accessToken = response?.data?.access_token;
            const user = response?.data?.user;

            // Dispatch the setAuth action with the user and token
            console.log('Login Token is :', accessToken);
            dispatch(setAuth({ user, accessToken }));
            
            setEmail('');
            setPassword('');
            navigate(from, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setError('No Server Response');
            } else if (err.response?.status === 401) {
                setError('Invalid Credentials');
            } else {
                setError('Login Failed');
            }
        }
    };

    return (
        <section className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h1>
                {error && <p className="text-red-600 text-center font-medium mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        autoComplete="off"
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        required 
                        className="p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                    />

                    <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        required 
                        className="p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                    />
                    
                    <button className="py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">Sign In</button>
                </form>
                 <p className="text-center text-gray-600 mt-4">
                    Need an Account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Login;

