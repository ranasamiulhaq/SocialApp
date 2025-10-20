<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    /**
     * Get a list of all registered users (excluding the current user).
     */
    public function getAllUsers()
    {
        $currentUserId = auth()->id();
        
        // Retrieve all users except the currently authenticated one
        $users = User::where('id', '!=', $currentUserId)
            ->get(['id', 'name']); // Only return necessary fields
        
        // Also get the list of users the current user is following for UI context
        $followingIds = auth()->user()->following()->pluck('id')->toArray();
            
        // Map the users to include the follow status
        $users->map(function ($user) use ($followingIds) {
            $user->is_following = in_array($user->id, $followingIds);
            return $user;
        });

        return response()->json($users);
    }

    public function getFollowingList(){
        $user = auth()->user();
        $following = $user->following()->select('id', 'name', 'email')->get();
        return response()->json($following);
    }
    
    public function getFollowersList(){
        $user = auth()->user();
        $followers = $user->followers()->select('id', 'name', 'email')->get();
        return response()->json($followers);
    }

    public function followUser(User $user)
    {
        $follower = auth()->user();

        if ($follower->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 400);
        }

        // Attach the relationship. It ignores if the relationship already exists.
        $follower->following()->syncWithoutDetaching([$user->id]);

        return response()->json(['message' => "Successfully followed {$user->name}"]);
    }

    /**
     * Unfollow a specific user.
     */
    public function unfollowUser(User $user)
    {
        $follower = auth()->user();

        // Detach (remove) the relationship
        $follower->following()->detach($user->id);

        return response()->json(['message' => "Successfully unfollowed {$user->name}"]);
    }
}
