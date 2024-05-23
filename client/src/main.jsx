import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import store from './redux/store';
import { Provider } from 'react-redux';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import Cookies from 'js-cookie';
// set another axios instance for cloudinary
const cloudinaryAxios = axios.create({
    baseURL: 'https://api.cloudinary.com/v1_1/dnmsfjbqj',
});
export default cloudinaryAxios;
// How to use cloudinaryAxios
// Set default Axios configuration
axios.defaults.baseURL = 'http://localhost:3000/api/v2';
axios.defaults.withCredentials = true;

// Function to refresh access token
const refreshAccessToken = async () => {
    try {
        const response = await axios.post('/auth/refresh-token', {}, {
            withCredentials: true
        });

        if (response.status === 200) {
            const { accessToken, refreshToken } = response.data;
            const expirationTime = jwtDecode(accessToken).exp;

            localStorage.setItem('expirationTime', expirationTime);
            Cookies.set('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken);

            return accessToken;
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
    }
};

// Axios request interceptor
axios.interceptors.request.use(
    async (config) => {
        let accessToken = Cookies.get('accessToken');
        const expirationTime = localStorage.getItem('expirationTime');

        if (expirationTime && Date.now() >= expirationTime * 1000) {
            accessToken = await refreshAccessToken();
        }

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
            config.headers['csrf-token'] = Cookies.get('csrfToken');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios response interceptor
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                axios.defaults.headers.common['csrf-token'] = Cookies.get('csrfToken');
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);
