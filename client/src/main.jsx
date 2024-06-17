import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import store from './redux/store';
import { Provider } from 'react-redux';
// import {jwtDecode} from 'jwt-decode'; // Corrected import
import Cookies from 'js-cookie';

// Set default Axios configuration
axios.defaults.baseURL = '/api/v2/';
axios.defaults.withCredentials = true;

// Function to refresh access token
const refreshAccessToken = async () => {
    try {
        // const response = await axios.post('/auth/refresh-token', {}, {
        //     withCredentials: true
        // });
        await axios.post('/auth/refresh-token')

        // set new expiration time in date now + 15 minutes
        // const expirationTime = Date.now() + 15 * 60 * 1000;
        // console.log(expirationTime)
        // localStorage.setItem('expirationTime', expirationTime.toString());
        // if (response.status === 200) {
        //     const { accessToken } = response.data;
        //     const expirationTime = jwtDecode(accessToken).exp;
        //     console.log(expirationTime)
        //
        //     localStorage.setItem('expirationTime', expirationTime.toString());
        //
        //     return accessToken;
        // }
    } catch (error) {
        console.error('Error refreshing access token:', error);
    }
};

// Axios request interceptor
axios.interceptors.request.use(
    async (config) => {
        // let accessToken = Cookies.get('accessToken');
        // const expirationTime = parseInt(localStorage.getItem('expirationTime'));
        // // convert to number
        // console.log(expirationTime)
        // console.log(Date.now())
        //
        // if (expirationTime && Date.now() >= expirationTime) {
        //     await refreshAccessToken();
        // }


        // if (expirationTime && Date.now() >= expirationTime * 1000) {
        //     await refreshAccessToken();
        // }

        // if (accessToken) {
        //     config.headers['Authorization'] = `Bearer ${accessToken}`;
        // }

        //for CSRF token
        const csrfToken = Cookies.get('csrfToken');
        if (csrfToken) {
            config.headers['csrf-token'] = csrfToken;
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
        if (error.response.status === 429) {
            alert(error.response.data.message)
        }
        if (error.response.status === 409){
            const originalRequest = error.config;
            if (error.response && !originalRequest._retry) {
                originalRequest._retry = true;
                await refreshAccessToken()
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