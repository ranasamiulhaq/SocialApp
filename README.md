# Social Media Dashboard

This project is a full-stack social media application featuring a Laravel API backend and a React dashboard frontend.

## 🚀 Project Overview

The application allows users to:
* Authenticate via API tokens (assumed to be handled by the backend).
* View a personalized feed (`/feed`).
* Create new posts (`/post`), which instantly update the feed.
* Explore and manage follow relationships with other users (`/users`, `/follow/{user}`, `/unfollow/{user}`).
* View follower and following counts in real-time.

## 🛠️ Tech Stack

**Backend (API & Database):**
* **Framework:** Laravel (PHP)
* **Database:** (Assumed MySQL/PostgreSQL/SQLite)
* **Authentication:** Laravel Sanctum (or similar API token solution)

**Frontend (Client):**
* **Framework:** React
* **Styling:** Tailwind CSS (used via utility classes)
* **State Management:** Redux (via `react-redux`)
* **Routing:** `react-router-dom`
* **HTTP Client:** Axios (using a custom `useAxiosPrivate` hook for authenticated requests)

## 💻 Backend Setup (Laravel)

### 1. Installation

1. Clone the repository and navigate into the Laravel directory.
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the example environment file and generate the application key:
   ```bash
		cp .env.example .env
		php artisan key:generate
   ```

### 1. Database and Seeding
The project includes custom Factories and Seeders to populate the database with realistic fake data for testing the feed and follow functionality.
To set up the database and seed it, run the following command. Warning: This command will drop all existing tables and data.

```bash
php artisan migrate:fresh --seed
```


	 
## Frontend Setup (React):
The frontend is a React application typically served by a development server.

### 1. Installation

1. Navigate into the frontend project directory (e.g., cd frontend).
2. Install JavaScript dependencies:
```bash
npm install
# or
yarn install
```


