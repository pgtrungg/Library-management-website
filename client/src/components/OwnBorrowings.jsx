import { useState, useEffect } from "react";
import axios from "axios";

function OwnBorrowing() {
    const [borrowings, setBorrowings] = useState([]);

    useEffect(() => {
        axios.get('/borrow')
            .then((response) => {
                if (response.data) {
                    setBorrowings(response.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching borrowings:', error);
            });
    }, []);

    const handleReturn = (id) => {
        axios.put(`/borrow/${id}`)
            .then((response) => {
                console.log('Borrow returned:', response.data);
                // Update borrowings state after returning
                setBorrowings(prevBorrowings => prevBorrowings.filter(borrowing => borrowing._id !== id));
            })
            .catch((error) => {
                console.error('Error returning borrow:', error);
            });
    };

    return (
        <div className={'overflow-x-auto'}>
            <table className="table">
                <thead>
                    <tr>
                        <th>Borrowing ID</th>
                        <th>Status</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {borrowings.map((borrowing) => (
                        <tr key={borrowing._id}>
                            <td>{borrowing._id}</td>
                            <td>{borrowing.status}</td>
                            <td>{new Date(borrowing.borrow_date).toLocaleDateString()}</td>
                            <td>{new Date(borrowing.return_date).toLocaleDateString()}</td>
                            <td>
                                {borrowing.status !== 'returned' && (
                                    <button className="btn btn-primary" onClick={() => handleReturn(borrowing._id)}>
                                        Return
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OwnBorrowing;
