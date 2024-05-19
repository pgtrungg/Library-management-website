import React, { useState } from 'react';
import axios from 'axios';

const AddBookForm = () => {
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
        coverImage: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prevState => ({
            ...prevState,
            coverImage: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('author', formData.author);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('publication_date', formData.publication_date);
        formDataToSend.append('publisher', formData.publisher);
        formDataToSend.append('language', formData.language);
        formDataToSend.append('isbn', formData.isbn);
        formDataToSend.append('quantity', formData.quantity);
        formDataToSend.append('categories', formData.categories);
        formDataToSend.append('cover', formData.coverImage);

        try {
            await axios.post('/books', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({
                title: '',
                author: '',
                description: '',
                publication_date: '',
                publisher: '',
                language: '',
                isbn: '',
                quantity: '',
                categories: '',
                coverImage: null
            });
            alert('Book added successfully!');
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Error adding book. Please try again.');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-bold mb-4">Upload Book Cover and Input Details</h2>
            <form onSubmit={handleSubmit}>
                {/* Your form inputs */}
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
                    <input type="text" id="categories" name="categories" value={formData.categories} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="cover" className="block mb-1">Cover Image:</label>
                    <input type="file" id="cover" name="cover" onChange={handleFileChange} className="w-full" required />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Upload Book</button>
            </form>
        </div>
    );
};

export default AddBookForm;
