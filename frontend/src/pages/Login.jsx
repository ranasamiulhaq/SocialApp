import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';

// Import Redux hooks and actions
import { useDispatch } from 'react-redux';
import { setAuth } from '../features/auth/authSlice';

const LOGIN_URL = '/login';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard"; 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post(LOGIN_URL, { email, password });
            const accessToken = response?.data?.access_token;
            const user = response?.data?.user;

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
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 backdrop-blur-sm bg-opacity-95">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            Email Address
                        </label>
                        <div className="relative">
                            <input 
                                type="email" 
                                id="email" 
                                autoComplete="off"
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                required 
                                placeholder="you@example.com"
                                className="w-full p-3.5 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400" 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                type="password" 
                                id="password" 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                required 
                                placeholder="••••••••"
                                className="w-full p-3.5 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400" 
                            />
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">New to our platform?</span>
                    </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-semibold text-sm transition-colors duration-300 group"
                    >
                        Create an account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </section>
    );
};

export default Login;