import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.accessToken;
        },
        setNewToken: (state, action) => {
            state.token = action.payload.accessToken;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
        }
    }
});

export const { setAuth, setNewToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;

