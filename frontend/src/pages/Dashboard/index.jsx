import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuth } from "../../features/auth/authSlice";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState, useCallback } from "react";
import axios from "axios"; 
import Feed from "./components/Feed.jsx"; // <-- Explicit .jsx extension added
import CreatePost from "./components/CreatePost.jsx"; // <-- Explicit .jsx extension added
import ExploreUsers from "./components/ExploreUsers.jsx"; // <-- Explicit .jsx extension added
import { LogOut, Home, Users, UserPlus, Search } from "lucide-react";

const Dashboard = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    
    // State for user data and follow lists
    const [userData, setUserData] = useState(null);
    const [followingData, setFollowingData] = useState(null);
    const [followersData, setFollowersData] = useState(null);

    // Internal routing state: 'feed' (default) or 'explore'
    const [currentView, setCurrentView] = useState('feed'); 

    // --- Data Fetching Functions (Refactored to be reusable) ---
    
    // Fetch current user data
    const getUser = useCallback(async (controller) => {
        try {
            const response = await axiosPrivate.get('/user', { signal: controller?.signal }); 
            setUserData(response.data);
            return response.data.id; 
        } catch (err) {
            if (!axios.isCancel(err)) { 
                navigate('/login', { state: { from: location }, replace: true });
            }
        }
    }, [axiosPrivate, navigate, location]);

    // Fetch following list - made stable with useCallback
    const getFollowing = useCallback(async (controller) => {
        try{
            const following = await axiosPrivate.get('/following', { signal: controller?.signal });
            setFollowingData(following.data);
            console.log("Following List updated:", following.data.length);
        } catch(err){
            if (!axios.isCancel(err)) {
                console.error("Error fetching following list:", err);
            }
        }
    }, [axiosPrivate]);

    // Fetch followers list - made stable with useCallback
    const getFollowers = useCallback(async (controller) => {
        try{
            const followers = await axiosPrivate.get('/followers', { signal: controller?.signal });
            setFollowersData(followers.data);
            console.log("Followers List updated:", followers.data.length);
        } catch(err){
            if (!axios.isCancel(err)) {
                console.error("Error fetching followers list:", err);
            }
        }
    }, [axiosPrivate]);

    // Initial Data Load Effect
    useEffect(() => {
        const controller = new AbortController();

        getUser(controller);
        getFollowing(controller);
        getFollowers(controller);

        return () => {
            controller.abort();
        }
    }, [getUser, getFollowing, getFollowers])


    const handleLogout = async () => {
        try {
            await axiosPrivate.post('/logout');
            dispatch(clearAuth());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    }

    // Function to render the middle column content based on currentView state
    const renderMainContent = () => {
        if (currentView === 'explore') {
            return (
                <ExploreUsers 
                    followingData={followingData || []} 
                    currentUserId={userData?.id}
                    // Pass the refresh function down to update counts when a user is followed/unfollowed
                    refreshFollowing={getFollowing} 
                />
            );
        }

        // Default to Feed view
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <CreatePost />
                </div>
                <Feed />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <nav className="flex items-center gap-4">
                        {/* Home Link (Feed View) */}
                        <button 
                            onClick={() => setCurrentView('feed')}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors rounded-lg 
                                ${currentView === 'feed' 
                                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </button>

                        {/* Explore Users Link (NEW) */}
                        <button 
                            onClick={() => setCurrentView('explore')}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors rounded-lg 
                                ${currentView === 'explore' 
                                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                        >
                            <Search size={18} />
                            <span className="hidden sm:inline">Explore Users</span>
                        </button>

                        <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Panel - User Info (unchanged) */}
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

                    {/* Middle Panel - Feed or Explore Users (Dynamically rendered) */}
                    <main className="lg:col-span-6">
                        {renderMainContent()}
                    </main>

                    {/* Right Panel - Following & Followers (unchanged) */}
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
