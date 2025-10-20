import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'; 
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';
import axios from 'axios';


const ExploreUsers = ({ followingData = [], currentUserId, refreshFollowing }) => {
    const axiosPrivate = useAxiosPrivate();
    const [allUsers, setAllUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [followState, setFollowState] = useState({}); 

    const isFollowed = (userId) => {
        return followingData.some(user => user.id === userId);
    };

    useEffect(() => {
        if (allUsers) {
            const initialFollowState = allUsers.reduce((acc, user) => {
                acc[user.id] = isFollowed(user.id) ? 'followed' : 'not_followed';
                return acc;
            }, {});
            setFollowState(initialFollowState);
        }
    }, [allUsers, followingData]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const response = await axiosPrivate.get('/users', { signal: controller.signal });
                const users = response.data.filter(user => user.id !== currentUserId); 
                setAllUsers(users);
                setError(null);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error("Error fetching all users:", err);
                    setError("Failed to load users. Please check your network or try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();

        return () => {
            controller.abort();
        };
    }, [axiosPrivate, currentUserId]);

    const handleFollow = async (userId, isCurrentlyFollowed) => {
        setFollowState(prev => ({ ...prev, [userId]: 'loading' }));

        const endpoint = isCurrentlyFollowed ? `/unfollow/${userId}` : `/follow/${userId}`;
        
        try {
            await axiosPrivate.post(endpoint);
            
            const newFollowedState = isCurrentlyFollowed ? 'not_followed' : 'followed';
            setFollowState(prev => ({ ...prev, [userId]: newFollowedState }));
            
            if (refreshFollowing) {
                refreshFollowing();
            }

        } catch (err) {
            console.error(`Error toggling follow status for user ${userId}:`, err);
            setFollowState(prev => ({ ...prev, [userId]: isCurrentlyFollowed ? 'followed' : 'not_followed' }));
        }
    };
    
    const filteredUsers = allUsers?.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Users size={24} className="text-blue-600" />
                    Explore Users
                </h2>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                                </div>
                            </div>
                            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-red-600">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Explore Users
            </h2>
            
            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
            </div>

            {/* User List */}
            <div className="space-y-4">
                {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map(user => {
                        const isFollowing = followState[user.id] === 'followed';
                        const isLoading = followState[user.id] === 'loading';

                        return (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-shadow hover:shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFollow(user.id, isFollowing)}
                                    disabled={isLoading}
                                    className={`
                                        flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-md
                                        ${isFollowing 
                                            ? 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:shadow-lg' // Following state style
                                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' // Follow state style
                                        }
                                        disabled:opacity-60 disabled:cursor-not-allowed w-32 justify-center
                                    `}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : isFollowing ? (
                                        <>
                                            <UserCheck size={16} />
                                            <span>Following</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} />
                                            <span>Follow</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        {allUsers === null ? 'Loading...' : 'No users match your search.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExploreUsers;
