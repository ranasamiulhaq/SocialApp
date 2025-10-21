<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log; // <-- ADDED: For logging debug info

class PostController extends Controller
{

    public function getAllPosts()
    {
        // Retrieves only the posts created by the currently authenticated user
        return Post::where('user_id', auth()->id())->get();
    }

    public function getFeedPosts()
    {
        // Check authentication
        if (!auth()->check()) {
            // Throwing AuthorizationException is good practice if the middleware somehow failed
            throw new AuthorizationException('You must be logged in to access the feed.');
        }
        
        // Get IDs of users the current user is following
        $followingIds = auth()->user()->following()->pluck('id')->toArray();
        // Include the current user's ID for their own posts
        $userIds = array_merge($followingIds, [auth()->id()]);
        
        $posts = Post::whereIn('user_id', $userIds)
            ->with('user') // Eager load the user relationship
            ->latest() // Order by creation date descending
            ->get();

        return response()->json($posts);
    }
    
    public function getPostById($id)
    {
        // Finds a specific post only if it belongs to the authenticated user
        return Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
    }

  public function createPost(Request $request)
    {
        $fileReceived = $request->hasFile('media_file');
        
        // --- DEBUG STEP 1: LOG FILE INFO BEFORE VALIDATION ---
        if ($fileReceived) {
            Log::info('[PostController] File Upload Detected: ' . $request->file('media_file')->getClientOriginalName());
            Log::info('File Mime Type: ' . $request->file('media_file')->getMimeType());
        } else {
            // This is the message that indicates the media_url will be NULL.
            Log::warning('[PostController] No file detected in request. (File will not be saved).'); 
        }
        // ---------------------------------------------------

        // 1. Validation
        try {
            $validatedData = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['required', 'string'],
                'media_file' => [
                    'sometimes', 
                    'file', 
                    'mimes:jpeg,png,jpg,gif,svg,mp4,mov,ogg,webm', 
                    'max:10240' 
                ], 
            ]);
            Log::info('[PostController] Validation Passed.'); 
        } catch (ValidationException $e) {
            Log::error('[PostController] Validation FAILED.', ['errors' => $e->errors()]); 
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[PostController] UNEXPECTED ERROR during Validation/Request.', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'An unexpected server error occurred during validation.',
                'error' => $e->getMessage(),
            ], 500);
        }

        $mediaPath = null;
        
        // 2. Handle File Upload (This block only executes if $request->hasFile() is true)
        try {
            // Check again using the stored flag, or directly with $request->hasFile()
            if ($fileReceived) {
                // Store the file in 'storage/app/public/posts_media'
                $mediaPath = $request->file('media_file')->store('posts_media', 'public');
                Log::info('[PostController] File Stored Successfully.', ['path' => $mediaPath]);
            }
        } catch (\Exception $e) {
             // CRITICAL: This catch block will tell you if permissions or the disk setup is wrong.
            Log::error('[PostController] FILE STORAGE FAILED.', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'File storage failed. Check server permissions/storage link.',
                'error' => $e->getMessage(),
            ], 500);
        }

        // 3. Create Post
        try {
            $post = Post::create([
                'user_id' => auth()->id(), 
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'media_url' => $mediaPath, // $mediaPath is null if file was not stored
            ]);
            Log::info('[PostController] Post Created Successfully.', ['post_id' => $post->id]);
        } catch (\Exception $e) {
            Log::error('[PostController] POST DB CREATION FAILED.', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Database record creation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
        
        // 4. Generate Public URL for response
        $publicMediaUrl = $mediaPath ? Storage::url($mediaPath) : null; 

        return response()->json([
            'post' => $post,
            'media_url' => $publicMediaUrl,
        ], 201);
    }

    public function deletePost($id)
    {
        $post = Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        
        // 1. Delete the associated media file from storage
        if ($post->media_url) {
            Storage::disk('public')->delete($post->media_url);
        }
        
        // 2. Delete the database record
        $post->delete();
        
        return response()->json(null, 204);
    }
}