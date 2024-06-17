import NavBar from "./components/NavBar.jsx";
import UsersTable from "./components/admin/UsersTable.jsx";
import BooksTable from "./components/user/BooksTable.jsx";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/Signup.jsx";
import AddBookForm from "./components/admin/AddBook.jsx";
import VerifyResult from './components/auth/VerifyResult.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import Profile from './components/user/Profile.jsx';
import BorrowsTable from './components/admin/BorrowsTable.jsx';
import OwnBorrowings from './components/user/OwnBorrowings.jsx';
import {useSelector} from 'react-redux';
import BookDetails from './components/user/BookDetails.jsx';
import EditBook from './components/admin/EditBook.jsx';
import UserDetails from './components/admin/UserDetails.jsx';
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
                <Route path="/verify-result/:status/:message" element={<VerifyResult />} />
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
