// Dashboard.jsx - FINAL CLEANUP

import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuth } from "../../features/auth/authSlice";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import axios from "axios"; 
import Feed from "./components/Feed";
import CreatePost from "./components/CreatePost";

const Dashboard = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const [userData, setUserData] = useState(null);
    const [followingData, setFollowingData] = useState(null);
    const [followersData, setFollowersData] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const getUser = async () => {
            try {
                const response = await axiosPrivate.get('/user', { signal: controller.signal }); 
                setUserData(response.data);
            } catch (err) {
                if (!axios.isCancel(err)) { 
                    navigate('/login', { state: { from: location }, replace: true });
                }
            }
        }

        const getFollowing = async () => {
            try{
                const following = await axiosPrivate.get('/following', { signal: controller.signal });
                setFollowingData(following.data);
                console.log("Following List:", following.data);
            } catch(err){
                if (!axios.isCancel(err)) {
                    console.error("Error fetching following list:", err);
                }
            }
        }

        const getFollowers = async () => {
            try{
                const followers = await axiosPrivate.get('/followers', { signal: controller.signal });
                setFollowersData(followers.data);
                console.log("Followers List:", followers.data);
            } catch(err){
                if (!axios.isCancel(err)) {
                    console.error("Error fetching followers list:", err);
                }
            }
        }

        getUser();
        getFollowing();
        getFollowers();

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

            <br />
            <br />
            <h1 className='text-2xl font-bold'>Following</h1>
            {followingData && followingData.length > 0 ? (
                followingData.map(user => (
                    <div key={user.id} className="mb-2">
                    <p>{user.email}</p>
                    </div>
                ))
                ) : (
                    <p>No following</p>
            )}
           
           <br/>
            <h1 className='text-2xl font-bold'>Followers</h1>
            {followersData && followersData.length > 0 ? (
                followersData.map(user => (
                    <div key={user.id} className="mb-2">
                    <p>{user.email}</p>
                    </div>
                ))
                ) : (
                    <p>No followers</p>
            )}

            <CreatePost />
            <Feed />

            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            <div className="mt-6">
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Sign Out</button>
            </div>
        </section>
    )
}

export default Dashboard;