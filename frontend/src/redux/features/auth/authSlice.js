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
    isAuthenticated: !!loadUserFromLocalStorage(),
};









const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;

            localStorage.setItem(
                'user',
                JSON.stringify(state.user)
            );
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;

            localStorage.removeItem('user');
        }
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer