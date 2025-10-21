import React, { useEffect, useState } from 'react';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Calendar, User, Image, Video } from "lucide-react";

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

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith('http')) return mediaUrl;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${mediaUrl}`;
  };

  const getMediaType = (mediaUrl) => {
    if (!mediaUrl) return null;
    const extension = mediaUrl.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const videoExtensions = ['mp4', 'mov', 'ogg', 'webm', 'avi'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return null;
  };

  return (
    <div className="space-y-4">
      {feedData ? (
        feedData.length > 0 ? (
          feedData.map(item => {
            const mediaUrl = getMediaUrl(item.media_url);
            const mediaType = getMediaType(item.media_url);

            return (
              <article key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
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

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {item.description}
                  </p>

                  {mediaUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden bg-gray-50">
                      {mediaType === 'image' && (
                        <div className="relative group">
                          <img 
                            src={mediaUrl} 
                            alt={item.title}
                            className="w-full h-auto max-h-96 object-contain mx-auto"
                            onError={(e) => {
                              console.error('Image failed to load:', mediaUrl);
                              e.target.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'flex flex-col items-center justify-center p-8 text-gray-400';
                              errorDiv.innerHTML = '<div class="text-sm">Image unavailable</div>';
                              e.target.parentElement.appendChild(errorDiv);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Image size={12} />
                            <span>Image</span>
                          </div>
                        </div>
                      )}
                      
                      {mediaType === 'video' && (
                        <div className="relative">
                          <video 
                            src={mediaUrl} 
                            controls
                            className="w-full h-auto max-h-96 object-contain mx-auto"
                            onError={(e) => {
                              console.error('Video failed to load:', mediaUrl);
                              e.target.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'flex flex-col items-center justify-center p-8 text-gray-400';
                              errorDiv.innerHTML = '<div class="text-sm">Video unavailable</div>';
                              e.target.parentElement.appendChild(errorDiv);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Video size={12} />
                            <span>Video</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {item.user.id === currentUserId && (
                      <button 
                        onClick={() => handleDeletePost(item.id)} 
                        className='font-semibold text-red-600 hover:text-red-700 transition-colors'
                      >
                        Delete Post
                      </button>
                    )}
                    <span className="ml-auto">
                      {new Date(item.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
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