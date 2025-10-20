import react from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useState } from "react";

const CreatePost = () => {
    const axiosPrivate = useAxiosPrivate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await axiosPrivate.post('/post', { title, description });
                console.log("Post created:", response.data);
                setTitle('');
                setDescription('');
            } catch (err) {
                console.error("Error creating post:", err);
            }
        };

    return(
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border border-gray-300 p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border border-gray-300 p-2 w-full"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Post</button>
            </form>
        </div>
    )
}

export default CreatePost;