import React, { useState } from 'react';
import axios from 'axios';

const AddBookForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: '',
        publication_year: '',
        quantity: '',
        coverImage: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, coverImage: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('author', formData.author);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('publication_year', formData.publication_year);
        formDataToSend.append('quantity', formData.quantity);
        formDataToSend.append('cover', formData.coverImage);

        try {
            await axios.post('/book/add', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({
                title: '',
                author: '',
                category: '',
                publication_year: '',
                quantity: '',
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
                <div className="mb-4">
                    <label htmlFor="title" className="block mb-1">Title:</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="author" className="block mb-1">Author:</label>
                    <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="category" className="block mb-1">Category:</label>
                    <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="publication_year" className="block mb-1">Publication Year:</label>
                    <input type="date" id="publication_year" name="publication_year" value={formData.publication_year} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="quantity" className="block mb-1">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
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
