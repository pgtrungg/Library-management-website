import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

const EditBook = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        publication_date: '',
        publisher: '',
        language: '',
        isbn: '',
        quantity: '',
        categories: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the existing book data
        axios.get(`/books/${bookId}`)
            .then(response => {
                const book = response.data;
                setFormData({
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    publication_date: book.publication_date ? new Date(book.publication_date).toISOString().split('T')[0] : '',
                    publisher: book.publisher,
                    language: book.language,
                    isbn: book.isbn,
                    quantity: book.quantity,
                    categories: book.categories_name,
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Book data fetched successfully',
                }).then()
                setLoading(false);
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! error: ' + error,
                }).then()
                setLoading(false);
            });
    }, [bookId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/books/${bookId}`, formData);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Book updated successfully',
            }).then()

            navigate('/');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! error: ' + error,
            }).then()
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-bold mb-4">Edit Book Details</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block mb-1">Title:</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="author" className="block mb-1">Author:</label>
                    <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block mb-1">Description:</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="publication_date" className="block mb-1">Publication Date:</label>                   
                    <input type="date" id="publication_date" name="publication_date" value={formData.publication_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="publisher" className="block mb-1">Publisher:</label>
                    <input type="text" id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="language" className="block mb-1">Language:</label>
                    <input type="text" id="language" name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="isbn" className="block mb-1">ISBN:</label>
                    <input type="text" id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="quantity" className="block mb-1">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="categories" className="block mb-1">Categories:</label>
                    <input type="text" id="categories"   name="categories" value={formData.categories} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
             
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Update Book</button>
            </form>
        </div>
    );
};

export default EditBook;

