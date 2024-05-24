import './App.css'
import NavBar from "./components/NavBar.jsx";
import UsersTable from "./components/UsersTable.jsx";
import BooksTable from "./components/BooksTable.jsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import AddBookForm from "./components/AddBook.jsx";
import BookProfile from "./components/Book.jsx";
import FinalRegister from './components/FinalRegister.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import Profile from './components/Profile.jsx';
import BorrowsTable from './components/BorrowsTable.jsx';
import OwnBorrowings from './components/OwnBorrowings.jsx';
import { useSelector } from 'react-redux';
import BookDetails from './components/BookDetails.jsx';
import EditBook from './components/EditBook.jsx';
import UserDetails from './components/UserDetails.jsx';
function App() {
    let user = useSelector(state => state.user);

    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<BooksTable />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/books/:bookId" element={<BookDetails />} />
                <Route path="/final-register/:status" element={<FinalRegister />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {user && (

                    <>
                        {user.role === "admin" && (
                            <>
                                <Route path="/admin/users" element={<UsersTable />} />
                                <Route path="/admin/books" element={<BooksTable />} />
                                <Route path="/admin/borrows" element={<BorrowsTable />} />
                                <Route path="/admin/books/add" element={<AddBookForm />} />
                                <Route path="/admin/books/edit/:bookId" element={<EditBook />} />
                                <Route path="/admin/users/:userId" element={<UserDetails />} />

                            </>
                        )}
                        <Route path="/book" element={<BookProfile />} />
                        <Route path="/borrowed-books" element={<OwnBorrowings />} />
                        <Route path="/profile" element={<Profile />} />
                
                        

                    </>
                )}
                <Route path="*" element={<h1>Not Found</h1>} />
            </Routes>
        </Router>
    )
}

export default App
