<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a specific user for testing the login (e.g., 'test@example.com')
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'), // Default password for easy testing
        ]);
        
        // 2. Create 19 more regular users (20 total)
        User::factory(19)->create();

        // Get all created users
        $users = User::all();

        // 3. Create posts
        // Create about 100 posts, distributed randomly among the 20 users
        // The Post::factory(100) call ensures the correct factory is used to generate 100 posts.
        Post::factory(100)->create([
            'user_id' => function () use ($users) {
                return $users->random()->id;
            },
        ]);

        // 4. Create Follow Relationships
        // This loops through all users and makes each user follow a random subset of other users.
        $users->each(function ($user) use ($users) {
            // Determine a random number of users to follow (e.g., between 5 and 15 others)
            $usersToFollow = $users->except($user->id)->random(rand(5, 15));

            // Attach the follow relationship
            $user->following()->attach($usersToFollow->pluck('id'));

            // NOTE: If you are using a many-to-many relationship (like I assumed above, $user->following()),
            // then the following method should exist on your User model:
            /*
            public function following()
            {
                return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id');
            }
            */
        });
    }
}
