<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    public function getAllUsers()
    {
        $currentUserId = auth()->id();
        
        $users = User::where('id', '!=', $currentUserId)
            ->get(['id', 'name']); 
        
        $followingIds = auth()->user()->following()->pluck('id')->toArray();
            
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

        $follower->following()->syncWithoutDetaching([$user->id]);

        return response()->json(['message' => "Successfully followed {$user->name}"]);
    }

    public function unfollowUser(User $user)
    {
        $follower = auth()->user();
        $follower->following()->detach($user->id);
        return response()->json(['message' => "Successfully unfollowed {$user->name}"]);
    }
}
