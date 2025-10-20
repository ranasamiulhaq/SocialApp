import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';


const loadAuthFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('auth');
        if (serializedState === null) {
            return undefined; 
        }
        return JSON.parse(serializedState);
    } catch (e) {   
        console.warn("Could not load state from local storage:", e);
        return undefined;
    }
};

const preloadedState = {
    auth: loadAuthFromLocalStorage()
};


export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    preloadedState
});

const saveAuthToLocalStorage = () => {
    try {
        const authState = store.getState().auth; 
        const serializedState = JSON.stringify(authState);
        localStorage.setItem('auth', serializedState);
    } catch (e) {
        console.warn("Could not save state to local storage:", e);
    }
};

store.subscribe(saveAuthToLocalStorage);
