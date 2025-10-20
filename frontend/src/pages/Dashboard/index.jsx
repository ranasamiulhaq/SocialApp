import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuth } from "../../features/auth/authSlice";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import axios from "axios"; 
import Feed from "./components/Feed";
import CreatePost from "./components/CreatePost";
import { LogOut, Home, Users, UserPlus } from "lucide-react";

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100">
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Panel - User Info */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                    {userData ? userData.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                {userData ? (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.name}</h2>
                                        <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
                                    </>
                                ) : (
                                    <div className="animate-pulse">
                                        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {followersData?.length || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Followers</p>
                                    </div>
                                    <div className="w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {followingData?.length || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Following</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Middle Panel - Feed */}
                    <main className="lg:col-span-6">
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <CreatePost />
                            </div>
                            <Feed />
                        </div>
                    </main>

                    {/* Right Panel - Following & Followers */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Following Section */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <UserPlus size={20} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-800">Following</h2>
                                <span className="ml-auto text-sm font-semibold text-gray-500">
                                    {followingData?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {followingData && followingData.length > 0 ? (
                                    followingData.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">{user.email}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No following yet</p>
                                )}
                            </div>
                        </div>

                        {/* Followers Section */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={20} className="text-purple-600" />
                                <h2 className="text-lg font-bold text-gray-800">Followers</h2>
                                <span className="ml-auto text-sm font-semibold text-gray-500">
                                    {followersData?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {followersData && followersData.length > 0 ? (
                                    followersData.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">{user.email}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No followers yet</p>
                                )}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    )
}

export default Dashboard;