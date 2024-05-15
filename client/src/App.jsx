import './App.css'
import NavBar from "./components/NavBar.jsx";
import UsersTable from "./components/UsersTable.jsx";
import BooksTable from "./components/BooksTable.jsx";

import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import AddBookForm from "./components/AddBook.jsx";
import BookProfile from "./components/Book.jsx";
import FinalRegister from './components/FinalRegister.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<BooksTable/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/final-register/:status" element={<FinalRegister/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/admin/users" element={<UsersTable/>}/>
                <Route path="/admin/books" element={<BooksTable/>}/>
                <Route path="/admin/borrows" element={<BooksTable/>}/>
                <Route path="/test" element={<AddBookForm/>}/>
                <Route path="/book" element={<BookProfile/>}/>
                <Route path="*" element={<h1>Not Found</h1>}/>
            </Routes>
        </Router>
    )
}

export default App
