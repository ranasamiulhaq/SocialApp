<?php

namespace App\Http\Controllers;

use App\Models\Post; // Assuming you have a Post model
use Illuminate\Http\Request;

class PostController extends Controller
{

    public function getAllPosts()
    {
        return Post::all()->where('user_id', auth()->id());
    }

     public function getFeedPosts()
    {
        $followingIds = auth()->user()->following()->pluck('id')->toArray();

        // Add the current user's ID to the list to show their own posts
        $userIds = array_merge($followingIds, [auth()->id()]);
        
        $posts = Post::whereIn('user_id', $userIds)
            ->with('user') // Eager load the user who created the post
            ->latest() // Order by creation date descending
            ->get();

        return response()->json($posts);
    }
    
    public function getPostById($id)
    {
        return Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
    }

    public function createPost(Request $request)
    {
        $post = Post::create([
            'user_id' => auth()->id(),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
        ]);

        return response()->json($post, 201);
    }

    public function deletePost($id)
    {
        $post = Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $post->delete();
        return response()->json(null, 204);
    }
}
