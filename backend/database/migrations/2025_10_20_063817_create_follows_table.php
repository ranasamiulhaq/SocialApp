<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            // The user who is doing the following
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            
            // The user who is being followed
            $table->foreignId('following_id')->constrained('users')->onDelete('cascade');
            
            // Use both IDs as the primary key to prevent duplicate follow relationships
            $table->primary(['follower_id', 'following_id']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
