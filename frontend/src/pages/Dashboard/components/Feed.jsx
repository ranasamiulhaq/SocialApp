import React from 'react';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import axiosPrivate from '../../../hooks/useAxiosPrivate';
import { Calendar, User } from "lucide-react";

const Feed = ({ currentUserId }) => {
  const axiosPrivate = useAxiosPrivate();
  const [feedData, setFeedData] = useState(null);


  useEffect(() => { 
    const fetchFeed = async () => {
      try {
        const response = await axiosPrivate.get('/feed');
        console.log("Feed Data:", response.data);
        setFeedData(response.data);
      } catch (err) {
        console.error("Error fetching feed data:", err);
      }
    };

    fetchFeed();
  }, [axiosPrivate]);

  const handleDeletePost = async (postId) => {
    try {
      await axiosPrivate.delete(`/post/${postId}`);
      setFeedData(prevData => prevData.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div className="space-y-4">
      {feedData ? (
        feedData.length > 0 ? (
          feedData.map(item => (
            <article key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Post Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {item.user.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                      <User size={14} />
                      <span className="truncate">{item.user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Calendar size={14} />
                    <span>{new Date(item.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {item.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Post Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {item.user.id === currentUserId && (
                    <button onClick={() => handleDeletePost(item.id)} className='font-semibold text-red-600 hover:text-red-500'>Delete Post ?</button>
                  )}
                  <span>
                    {new Date(item.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to create a post!</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;