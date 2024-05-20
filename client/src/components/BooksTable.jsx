import { useState } from "react";
import { useDispatch } from 'react-redux';
import { addBook } from '../redux/slices/cartSlice.jsx';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCartOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

function BooksTable() {
    let [books, setBooks] = useState([]);
    let navigate = useNavigate();
    let user = useSelector((state) => state.user);

    let [filteredBooks, setFilteredBooks] = useState({});
    const getQuery = () => {
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

    const filterBooks = () => {
        let query = getQuery();
        try {
            axios.get('/books', { params: query })
                .then((response) => {
                    if (response.data)
                        setBooks(response.data);
                });
        } catch (error) {
            console.error(error);
        }
    }

    if (books.length === 0) {
        let query = getQuery();
        try {
            axios.get('/books', { params: query })
                .then((response) => {
                    if (response.data.length > 0)
                        setBooks(response.data);
                });
        } catch (error) {
            console.error(error);
        }
    }

    const dispatch = useDispatch();

    const addToCart = (book) => {
        // Ask the user for the quantity
        let quantity = prompt('Enter the quantity');
        if (!quantity) {
            return;
        }
        if (isNaN(quantity)) {
            alert('Quantity must be a number');
            return;
        }
        if (quantity <= 0 || quantity % 1 !== 0 || quantity > book.quantity) {
            alert('Invalid quantity');
            return;
        }
        book.quantity = quantity;
        dispatch(addBook(book));
    }
    const removeBook = (bookId) => {
        axios.delete(`/books/${bookId}`)
            .then((response) => {
                if (response.status === 200) {
                    setBooks(books.filter((b) => b._id !== bookId));
                }
            })
            .catch((error) => {
                console.error('Error deleting book:', error);
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
                        onChange={(e) => setFilteredBooks({ ...filteredBooks, title: e.target.value })} />
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by author" className="input input-bordered"
                        value={filteredBooks.author}
                        onChange={(e) => setFilteredBooks({ ...filteredBooks, author: e.target.value })} />
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by publisher" className="input input-bordered"
                        value={filteredBooks.publisher}
                        onChange={(e) => setFilteredBooks({ ...filteredBooks, publisher: e.target.value })} />
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by ISBN" className="input input-bordered"
                        value={filteredBooks.isbn}
                        onChange={(e) => setFilteredBooks({ ...filteredBooks, isbn: e.target.value })} />
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by date published" className="input input-bordered"
                        value={filteredBooks.datePublished}
                        onChange={(e) => setFilteredBooks({ ...filteredBooks, datePublished: e.target.value })} />
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
                                            <ShoppingCartOutlined />
                                        </button>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td>
                                            <button onClick={() => removeBook(book._id)}>
                                                <DeleteOutlined />
                                            </button>
                                        </td>
                                    )}
                                    {user.role === 'admin' && (
                                        <td>
                                            <button onClick={() => editBook(book._id)}>
                                                <EditOutlined />
                                            </button>
                                        </td>
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