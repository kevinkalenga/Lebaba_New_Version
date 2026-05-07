import { createSlice } from "@reduxjs/toolkit";

const loadUser = () => {
    try {
        const data = localStorage.getItem("user");
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const initialState = {
    user: loadUser(),
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
    state.user = action.payload.user;
    state.token = action.payload.token || state.token;
    state.isAuthenticated = true;

    localStorage.setItem("user", JSON.stringify(action.payload.user));
    // localStorage.setItem("token", action.payload.token);

    if (action.payload.token) {
        localStorage.setItem(
            "token",
            action.payload.token
        );
    }
},

logout: (state) => {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
}
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;