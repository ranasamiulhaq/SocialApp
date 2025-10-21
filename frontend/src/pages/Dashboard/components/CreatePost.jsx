import React, { useState, useRef } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Send, FileText, AlignLeft, Image as ImageIcon, X } from "lucide-react";

const CreatePost = () => {
    const axiosPrivate = useAxiosPrivate();
    const fileInputRef = useRef(null); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mediaFile, setMediaFile] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        console.log('🔍 File input changed:', file ? file.name : 'No file');
        
        if (file) {
            setMediaFile(file);
            console.log('✅ File set in state:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
        } else {
            setMediaFile(null);
            console.log('⚠️ File cleared from state');
        }
    };
    
    const handleRemoveMedia = () => {
        console.log('🗑️ Removing media...');
        setMediaFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            console.log('✅ File input cleared');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        // CRITICAL FIX: Use the state variable instead of the ref
        // because the file input gets unmounted when preview is shown
        console.log('🔍 Checking mediaFile state:', {
            hasFile: !!mediaFile,
            fileName: mediaFile?.name,
            fileType: mediaFile?.type,
            fileSize: mediaFile?.size
        });

        // Use mediaFile from state (not from ref!)
        if (mediaFile) {
            formData.append('media_file', mediaFile);
            console.log('✅ File attached to FormData:', {
                name: mediaFile.name,
                type: mediaFile.type,
                size: mediaFile.size
            });
        } else {
            console.log('ℹ️ No file selected');
        }

        // Debug: Verify FormData contents
        console.log('📦 FormData entries:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}:`, `[File: ${value.name}]`);
            } else {
                console.log(`  ${key}:`, value);
            }
        }

        try {
            // CRITICAL: DO NOT set Content-Type header manually
            // Let the browser set it with the correct boundary parameter
            const response = await axiosPrivate.post('/post', formData);
            
            console.log("✅ Post created successfully:", response.data);
            setStatusMessage("Post created successfully!");
            
            // Clear form
            setTitle('');
            setDescription('');
            handleRemoveMedia(); 
        } catch (err) {
            console.error("❌ Error creating post:", err);
            console.error("Error response:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.message || "Failed to create post.";
            setStatusMessage(`Failed to create post: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div className="p-6 max-w-xl mx-auto bg-white shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <FileText size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">Create a New Post</h2>
            </div>
            
            {statusMessage && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                    statusMessage.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {statusMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title Input */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2" htmlFor="title">
                        <FileText size={16} className="text-blue-600" />
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter an engaging title..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                        required
                    />
                </div>
                
                {/* Description Input */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2" htmlFor="description">
                        <AlignLeft size={16} className="text-purple-600" />
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none bg-gray-50 hover:bg-white"
                        required
                    />
                </div>
                
                {/* Media Upload Input with Preview and Removal */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2" htmlFor="media">
                        <ImageIcon size={16} className="text-green-600" />
                        Optional Media (Image/Video)
                    </label>

                    {mediaFile ? (
                        <div className="mt-3 p-3 bg-white rounded-xl shadow-md border border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-600 mb-3 border-b pb-2">Media Preview:</h4>
                            
                            {mediaFile.type.startsWith('image/') && (
                                <img 
                                    src={URL.createObjectURL(mediaFile)} 
                                    alt="Media Preview" 
                                    className="max-w-full h-auto max-h-48 object-contain rounded-lg mx-auto"
                                />
                            )}
                            
                            {mediaFile.type.startsWith('video/') && (
                                <video 
                                    src={URL.createObjectURL(mediaFile)} 
                                    controls 
                                    className="max-w-full h-auto max-h-48 object-contain rounded-lg mx-auto"
                                />
                            )}
                            
                            <p className="mt-4 text-sm text-gray-600 text-center truncate">
                                Selected: <span className="font-semibold text-green-700">{mediaFile.name}</span>
                            </p>

                            <button 
                                type="button" 
                                onClick={handleRemoveMedia}
                                className="mt-4 w-full flex items-center justify-center gap-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <X size={16} />
                                Remove Media
                            </button>
                        </div>
                    ) : (
                        <input
                            type="file"
                            id="media"
                            ref={fileInputRef}
                            accept="image/*,video/*" 
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-green-50 file:text-green-700
                                    hover:file:bg-green-100"
                        />
                    )}
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading & Creating...</span>
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            <span>Create Post</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}

export default CreatePost;