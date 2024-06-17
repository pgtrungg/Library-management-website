import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Swal from "sweetalert2";

const BookDetails = () => {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newReview, setNewReview] = useState({ text: '', rating: 1 });
    const user = useSelector((state) => state.user);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`/books/${bookId}`);
                setBook(response.data);
                setIsLoading(false);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! error: ' + error,
                }).then()
                setIsLoading(false);
            }
        };

        const fetchBookReviews = async () => {
            try {
                const response = await axios.get(`/books/${bookId}/reviews`);
                setReviews(response.data);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! error: ' + error,
                }).then()
            }
        };

        fetchBookDetails();
        fetchBookReviews();
    }, [bookId]);

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview({ ...newReview, [name]: value });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/books/${bookId}/reviews`, newReview, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setReviews([...reviews, response.data]);
            setNewReview({ text: '', rating: 1, username: user.username });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! error: ' + error,
            }).then()
        }
    };
    

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!book) {
        return <div>Book not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">{book.title}</h1>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Publication Date:</strong> {new Date(book.publication_date).toLocaleDateString()}</p>
            <p><strong>Categories:</strong> {book.categories_name}</p>
            <p><strong>Description:</strong> {book.description}</p>

            {book.cover && (
    <div className="flex justify-center mt-4">
        <img src={book.cover} alt="Book cover" style={{ maxWidth: '300px' }} />
    </div>
)}

            <h2 className="text-xl font-bold mt-8 mb-4">Reviews</h2>
            {reviews.length > 0 ? (
                <ul>
                    {reviews.map((review) => (
                        <li key={review._id} className="mb-4 border border-gray-200 rounded-md p-4 flex justify-between">
                            <div>
                                <p><strong>{review.username || 'Anonymous'}:</strong> {review.comment.substring(0, 100)}</p>
                            </div>
                            <div className="flex items-center">
                                <p className="text-gray-500">Rating: {review.rating}/5</p>
                            </div>
                            
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reviews yet.</p>
            )}

            {user && (
                <form onSubmit={handleReviewSubmit} className="mt-4">
                    <h3 className="text-lg font-bold mb-2">Add a Review</h3>
                    <textarea
                        name="text"
                        value={newReview.text}
                        onChange={handleReviewChange}
                        className="w-full p-2 border rounded-md mb-2"
                        placeholder="Write your review here..."
                        required
                    />
                    <div>
                        <label htmlFor="rating" className="block mb-2">Rating:</label>
                        <select
                            name="rating"
                            value={newReview.rating}
                            onChange={handleReviewChange}
                            className="w-full p-2 border rounded-md mb-4"
                        >
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    >
                        Submit Review
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookDetails;
