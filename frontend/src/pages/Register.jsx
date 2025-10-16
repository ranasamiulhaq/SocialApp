import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from '../api/axios';

const REGISTER_URL = '/register';

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [matchPwd, setMatchPwd] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== matchPwd) {
            setErrMsg("Passwords do not match");
            return;
        }

        try {
            await axios.post(REGISTER_URL,
                { name, email, password, password_confirmation: matchPwd },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            setSuccess(true);
            setName('');
            setEmail('');
            setPassword('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 422) {
                // This can be more specific by parsing the errors object from Laravel
                setErrMsg('Email is already taken or invalid data');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            {success ? (
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Success!</h1>
                    <p className="text-gray-600">You can now sign in with your new account.</p>
                    <p className="mt-6">
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                    <p ref={errRef} className={`text-red-600 text-center font-medium mb-4 ${errMsg ? "block" : "hidden"}`} aria-live="assertive">{errMsg}</p>
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Name:</label>
                        <input
                            type="text"
                            id="name"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />

                        <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email:</label>
                        <input
                            type="email"
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />

                        <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />

                        <label htmlFor="confirm_pwd" className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">Sign Up</button>
                    </form>
                    <p className="text-center text-gray-600 mt-4">
                        Already registered?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}

export default Register;

