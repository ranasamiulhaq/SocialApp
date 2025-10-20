import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';

// ------------------------------------------
// 1. Persistence Initialization Function
// ------------------------------------------
const loadAuthFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('auth');
        if (serializedState === null) {
            return undefined; // Let Redux use the default initial state
        }
        return JSON.parse(serializedState);
    } catch (e) {   
        console.warn("Could not load state from local storage:", e);
        return undefined;
    }
};

// Load initial state, if available
const preloadedState = {
    auth: loadAuthFromLocalStorage()
};

// ------------------------------------------
// 2. Configure Store (using preloadedState)
// ------------------------------------------
export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    // Pass the state loaded from localStorage to initialize the store
    preloadedState
});

// ------------------------------------------
// 3. Persistence Subscriber Function
// ------------------------------------------
const saveAuthToLocalStorage = () => {
    try {
        // Only save the 'auth' slice (user and token)
        const authState = store.getState().auth; 
        const serializedState = JSON.stringify(authState);
        localStorage.setItem('auth', serializedState);
    } catch (e) {
        console.warn("Could not save state to local storage:", e);
    }
};

// Subscribe to store changes and save the state whenever the state updates
store.subscribe(saveAuthToLocalStorage);
