import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from "axios";
import store from './redux/store';
import {Provider} from 'react-redux';

axios.defaults.baseURL = 'http://localhost:3000/api/v2'
axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>,
)
