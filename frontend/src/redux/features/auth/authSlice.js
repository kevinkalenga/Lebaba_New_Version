import { createSlice } from "@reduxjs/toolkit";




const loadUserFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('user');
        if (serializedState == null) return null;
        return JSON.parse(serializedState);
    } catch (error) {
        return null;
    }
};




const initialState = {
    user: loadUserFromLocalStorage(),
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!loadUserFromLocalStorage(),
};









const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            localStorage.setItem(
                'user',
                JSON.stringify(state.user)
            );
            localStorage.setItem('token', action.payload.token);
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer