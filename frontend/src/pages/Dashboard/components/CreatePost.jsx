import React from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useState } from "react";
import { Send, FileText, AlignLeft } from "lucide-react";

const CreatePost = () => {
    const axiosPrivate = useAxiosPrivate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axiosPrivate.post('/post', { title, description });
            console.log("Post created:", response.data);
            setTitle('');
            setDescription('');
        } catch (err) {
            console.error("Error creating post:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Create a New Post</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                        <FileText size={16} className="text-blue-600" />
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter an engaging title..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                        required
                    />
                </div>
                
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                        <AlignLeft size={16} className="text-purple-600" />
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none bg-gray-50 focus:bg-white"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating...</span>
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