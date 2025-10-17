// Dashboard.jsx - FINAL CLEANUP

import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuth } from "../features/auth/authSlice";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import axios from "axios"; 

const Dashboard = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const getUser = async () => {
            console.log('🚀 DASHBOARD MOUNT: Starting protected API call to /user');
            try {
                const response = await axiosPrivate.get('/user', { signal: controller.signal }); 
                setUserData(response.data);
                console.log('✅ DASHBOARD FETCH: User data successfully retrieved.');
            } catch (err) {
                // Since Strict Mode is off, any error here is a genuine failure.
                // Revert to original robust logic: check for cancellation (just in case)
                // and redirect on any other error (401, Network Error, etc.).
                if (!axios.isCancel(err)) { 
                    console.error('❌ DASHBOARD FETCH FAILED (CRITICAL): Redirecting to login.');
                    console.error('Failure Details:', err.response?.status, err.message);
                    navigate('/login', { state: { from: location }, replace: true });
                }
            }
        }

        getUser();

        return () => {
            controller.abort();
        }
    }, [axiosPrivate, navigate, location])


    const handleLogout = async () => {
        try {
            await axiosPrivate.post('/logout');
            dispatch(clearAuth());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <section className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            {userData ? (
                <p className="text-lg">Welcome, <span className="font-semibold">{userData.name}</span> ({userData.email})!</p>
            ) : <p>Loading user data...</p>}
            <br />
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            <div className="mt-6">
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Sign Out</button>
            </div>
        </section>
    )
}

export default Dashboard;