import {Link, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {logout} from "../redux/slices/userSlice";
import {clearCart, removeBook} from "../redux/slices/cartSlice.jsx";
import axios from "axios";
import Swal from "sweetalert2";


function NavBar() {
    let navigate = useNavigate();
    let user = useSelector((state) => state.user);
    let cart = useSelector((state) => state.cart);

    let dispatch = useDispatch();

    let logOutUser = () => {
        try {
            axios.post('auth/logout')
                .then(() => {
                    dispatch(logout());
                    dispatch(clearCart());
                    navigate('/login');
                });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! error: ' + error,
            }).then()
        }
    }

    let handleRemoveFromCart = (book) => {
        dispatch(removeBook(book));
    }
    let handleBorrow = async () => {
        if (!user) {
            alert('Please log in to borrow books.');
            return;
        }

        let days = prompt('Enter the number of days you want to borrow the books (max 30 days):');
        days = parseInt(days);

        if (isNaN(days) || days < 1 || days > 30) {
            alert('Please enter a valid number of days between 1 and 30.');
            return;
        }

        const borrowData = {
            user_id: user._id,
            book_list: cart.map(item => ({ book_id: item._id, quantity: item.quantity })),
            days: days
        };

        try {
            await axios.post('/borrow', borrowData);
            dispatch(clearCart());
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Books borrowed successfully!',
            }).then();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! error: ' + error,
            }).then()
        }
    }

    return (
        <div className="navbar bg-base-100">
            {/*Logo*/}
            <div className="flex-1">
                <Link to={"/"} className="text-2xl font-bold cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                </Link>
            </div>

            {/*Nav Items*/}
            <div className="flex-none">
                {/*Admin Only*/}
                {
                    user && user.role === 'admin' ?
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} className="btn btn-ghost">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                            </div>
                            <ul tabIndex={0}
                                className="dropdown-content z-[1] menu menu-accordion w-52 shadow bg-base-100 rounded-box">
                                <li>
                                    <Link to={"/admin/users"}>Users</Link>
                                </li>
                                <li>
                                    <Link to={"/admin/books"}>Books</Link>
                                </li>
                                <li>
                                    <Link to={"/admin/borrows"}>Borrows</Link>
                                </li>
                                <li>
                                    <Link to={"/admin/books/add"}>Upload book</Link>
                                </li>
                            </ul>
                        </div>
                        :
                        <></>
                }
                {/*Cart*/}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <div className="indicator">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                 viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            <span className="badge badge-sm indicator-item">{cart.length}</span>
                        </div>
                    </div>
                    <table className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-60">
                        <tbody className="overflow-y-auto max-h-40 w-full">
                        {cart.map((item, index) => {
                            const itemClass = index % 2 === 0 ? 'bg-base-200' : 'bg-red';

                            return (
                                <div key={index}
                                     className={`flex justify-between mb-2 ${itemClass} radius rounded-box w-full`}>
                                    <div className="flex items-center space-x-2">
                                        <div className="avatar">
                                            <div className="mask mask-squircle h-10">
                                                <img
                                                    src={item.cover ? item.cover : "https://images-na.ssl-images-amazon.com/images/I/51ZJ2q4SgPL._SX331_BO1,204,203,200_.jpg"}
                                                    alt="Avatar Tailwind CSS Component"/>
                                            </div>
                                        </div>
                                        <div className="ml-2 text-left">
                                            <p className="font-bold">{item.title}</p>
                                            <p className="text-xs">{item.author}</p>
                                        </div>
                                    </div>
                                    <div className=''>
                                        <p className="font-bold">x{item.quantity}</p>
                                        <button className="btn btn-ghost btn-circle"
                                                onClick={() => handleRemoveFromCart(item)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                 viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        </tbody>
                        <tfoot className="text-center">
                        {cart.length > 0 ?
                            user ?
                                <tr className="flex justify-center">
                                    <td colSpan={2}>
                                        <button onClick={handleBorrow} className={"btn btn-primary items-center"}>Borrow</button>
                                    </td>
                                </tr>
                                :
                                <tr className="flex justify-center">
                                    <td colSpan={2}>
                                        <Link to={"/login"} className={"btn btn-primary items-center"}>Login to
                                            Borrow</Link>
                                    </td>
                                </tr>

                            :
                            <tr>
                                <td colSpan={2}>
                                    <p className="text-center">Cart is empty</p>
                                </td>
                            </tr>
                        }
                        </tfoot>
                    </table>

                </div>

                {/*Profile*/}
                <div className="dropdown dropdown-bottom dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img alt="Tailwind CSS Navbar component"
                                 src={
                                     user ?
                                         user.avatar ?
                                             user.avatar :
                                             "https://www.computerhope.com/jargon/g/guest-user.png"
                                         :
                                         "https://www.computerhope.com/jargon/g/guest-user.png"
                                 }/>
                        </div>
                    </div>
                    <ul tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box inline-block min-w-40">
                        {
                            user ?
                                <>
                                    <li className="text-center font-bold text-xl mb-2">
                                        {user.username}
                                    </li>
                                    <li>
                                        <Link to={'/borrowed-books'}>Borrowed Books</Link>
                                    </li>
                                    <li>
                                        <Link to={"/profile"}>Profile</Link>
                                    </li>
                                    <li>
                                        <button onClick={logOutUser}>Log Out</button>
                                    </li>
                                </>
                                :
                                <>
                                    <li>
                                        <Link to={"/signup"}>Sign Up</Link>
                                    </li>
                                    <li>
                                        <Link to={"/login"}>Login</Link>
                                    </li>
                                </>

                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NavBar;