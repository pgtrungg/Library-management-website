import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookProfile = () => {
    const [book, setBook] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`/book/get/66487dfaa77ae9192b91a46e`);
                setBook(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching book:', error);
            }
        };
        fetchBook();
    }, ['66487dfaa77ae9192b91a46e']);

    return (
        <div className="max-w-lg mx-auto p-4 bg-gray-100 rounded-md">
            {book ? (
                <>
                    <h2 className="text-xl font-bold mb-4">{book.title}</h2>
                    <div className="flex mb-4">
                        <img src={`data:image/${book.img.contentType};base64,${book.img.data.toString('base64')}`}
                             alt={book.title} className="w-32 h-32 mr-4 object-cover rounded-md" />
                        <div>
                            <p><span className="font-semibold">Author:</span> {book.author}</p>
                            <p><span className="font-semibold">Category:</span> {book.category}</p>
                            <p><span className="font-semibold">Publication Year:</span> {book.publication_year}</p>
                            <p><span className="font-semibold">Quantity:</span> {book.quantity}</p>
                        </div>
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default BookProfile;
