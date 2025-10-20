<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'), 
        ]);
        
        User::factory(19)->create();
        $users = User::all();

        Post::factory(100)->create([
            'user_id' => function () use ($users) {
                return $users->random()->id;
            },
        ]);

        $users->each(function ($user) use ($users) {
            $usersToFollow = $users->except($user->id)->random(rand(5, 15));
            $user->following()->attach($usersToFollow->pluck('id'));
        });
    }
}
