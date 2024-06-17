import { useState } from "react";
import {useDispatch, useSelector} from 'react-redux';
import { addBook } from '../../redux/slices/cartSlice.jsx';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const BooksTable = () => {
    let [books, setBooks] = useState([]);
    let navigate = useNavigate();
    let user = useSelector((state) => state.user);

    let [filteredBooks, setFilteredBooks] = useState({});
    const getQuery = async () => {
        let query = {};
        if (filteredBooks.title) {
            query.title = filteredBooks.title;
        }
        if (filteredBooks.author) {
            query.author = filteredBooks.author;
        }
        if (filteredBooks.publisher) {
            query.publisher = filteredBooks.publisher;
        }
        if (filteredBooks.isbn) {
            query.isbn = filteredBooks.isbn;
        }
        if (filteredBooks.datePublished) {
            query.datePublished = filteredBooks.datePublished;
        }
        return query;
    }

    const filterBooks = async () => {
        let query = getQuery();
        try {
            await axios.get('/books', {params: query})
                .then((response) => {
                    if (response.data)
                        setBooks(response.data);
                });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! error: ' + error,
            }).then()
        }
    }

    if (books.length === 0) {
        let query = getQuery();
        axios.get('/books', {params: query})
                .then((response) => {
                    if (response.data.length > 0)
                        setBooks(response.data);
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong! error: ' + error,
                    }).then()
                })
            }



    const dispatch = useDispatch();

    const addToCart = async (book) => {
        const {value: quantity} = await Swal.fire({
            title: 'Enter the quantity',
            input: 'number',
            inputAttributes: {
                min: 1,
                step: 1,
            },
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter a quantity!';
                }
                if (isNaN(value)) {
                    return 'Quantity must be a number';
                }
                if (value <= 0 || value % 1 !== 0 || value > book.quantity) {
                    return 'Invalid quantity';
                }
                return null;
            }
        });
        if (quantity) {
            let book1 = {...book};
            book1.quantity = parseInt(quantity, 10);  // Ensure quantity is an integer
            dispatch(addBook(book1));
        }
    }
    const removeBook = (bookId) => {

        Swal.fire({
            title: 'Are you sure you want to delete this book?',
            text: 'You will not be able to recover this book!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {

                axios.delete(`/books/${bookId}`)
                    .then((response) => {
                        if (response.status === 200) {
                            setBooks(books.filter((b) => b._id !== bookId));
                        }
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something went wrong! error: ' + error,
                        }).then()
                    });
            }
        });
    }

    const viewDetail = (bookId) => {
        navigate(`/books/${bookId}`)
    }
    const editBook = (bookId) => {
        navigate(`admin/books/edit/${bookId}`)
    }


    return (
        <>
            {/*Filter*/}
            <div className='form-container'>
                <div className='form-control'>
                    <input type="text" placeholder="Search by title" className="input input-bordered"
                           value={filteredBooks.title}
                           onChange={(e) => setFilteredBooks({...filteredBooks, title: e.target.value})}/>
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by author" className="input input-bordered"
                           value={filteredBooks.author}
                           onChange={(e) => setFilteredBooks({...filteredBooks, author: e.target.value})}/>
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by publisher" className="input input-bordered"
                           value={filteredBooks.publisher}
                           onChange={(e) => setFilteredBooks({...filteredBooks, publisher: e.target.value})}/>
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by ISBN" className="input input-bordered"
                           value={filteredBooks.isbn}
                           onChange={(e) => setFilteredBooks({...filteredBooks, isbn: e.target.value})}/>
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by date published" className="input input-bordered"
                           value={filteredBooks.datePublished}
                           onChange={(e) => setFilteredBooks({...filteredBooks, datePublished: e.target.value})}/>
                </div>
                <div className="form-control">
                    <button className="btn btn-primary" onClick={filterBooks}>
                        Filter
                    </button>
                </div>
            </div>
            <div className={'overflow-x-auto'}>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Publisher</th>
                        <th>Date Published</th>
                        <th>Quantity</th>
                        <th>More Details</th>

                    </tr>
                    </thead>
                    <tbody>
                    {books.map((book) => {
                            return (
                                <tr key={book._id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.isbn}</td>
                                    <td>{book.publisher}</td>
                                    <td>
                                        {new Date(book.publication_date).toLocaleDateString()}
                                    </td>
                                    <td>{book.quantity}</td>
                                    <td>
                                        <button
                                            className="underline hover:text-blue-500"
                                            onClick={() => viewDetail(book._id)}
                                        >
                                            View
                                        </button>

                                    </td>
                                    <td>
                                        {/* Add to Cart Button */}
                                        <button onClick={() => addToCart(book)}>
                                            <ShoppingCartOutlined/>
                                        </button>
                                    </td>
                                    {user && user.role === 'admin' && (
                                        <>
                                            <td>
                                                <button onClick={() => removeBook(book._id)}>
                                                    <DeleteOutlined/>
                                                </button>
                                            </td>
                                            <td>
                                                <button onClick={() => editBook(book._id)}>
                                                    <EditOutlined/>
                                                </button>
                                            </td>
                                        </>
                                    )}

                                </tr>
                            )
                        }
                    )}
                    </tbody>
                </table>
            </div>
        </>
    )


}

export default BooksTable