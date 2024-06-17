import {createSlice} from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
const initialState = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload));
            return action.payload;
        },
        logout: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('expirationTime');
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');

            return null;
        }
    }
});

export const {login, logout} = userSlice.actions;
export default userSlice.reducer;