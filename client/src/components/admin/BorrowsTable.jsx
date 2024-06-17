import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function BorrowsTable() {
    const [borrowings, setBorrowings] = useState([]);
    const [filteredBorrowings, setFilteredBorrowings] = useState({});
    


    const getQuery = () => {
        let query = {};
        if (filteredBorrowings.user_id) {
            query.user_id = filteredBorrowings.user_id;
        }
        if (filteredBorrowings.status) {
            query.status = filteredBorrowings.status;
        }
        return query;
    }

    const queryBorrowings = async () => {
        const query = getQuery();
        axios.get('/borrow/admin/all', { params: query })
            .then(response => {
                if (response.data) {
                    setBorrowings(response.data);
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! error: ' + error,
                }).then()
            });
    }

    queryBorrowings().then()

    return (
        <>
            {/* Filter */}
            <div className='form-container'>
                <div className='form-control'>
                    <input type="text" placeholder="Search by user ID" className="input input-bordered"
                           value={filteredBorrowings.user_id || ''}
                           onChange={(e) => setFilteredBorrowings({ ...filteredBorrowings, user_id: e.target.value })}/>
                </div>
                <div className='form-control'>
                    <input type="text" placeholder="Search by status" className="input input-bordered"
                           value={filteredBorrowings.status || ''}
                           onChange={(e) => setFilteredBorrowings({ ...filteredBorrowings, status: e.target.value })}/>
                </div>
                {/* Add more filter inputs as needed */}
                <div className="form-control">
                    <button className="btn btn-primary" onClick={queryBorrowings}>
                        Filter
                    </button>
                </div>
            </div>
            <div className={'overflow-x-auto'}>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Borrowing ID</th>
                        <th>User ID</th>
                        <th>Status</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                        <th>Actual Return Date</th>
                        {/* Add more table headers for other borrow details */}
                    </tr>
                    </thead>
                    <tbody>
                    {borrowings.map((borrowing) => (
                        <tr key={borrowing._id}>
                            <td>{borrowing._id}</td>
                            <td>{borrowing.user_id}</td>
                            <td>{borrowing.status}</td>
                            <td>{new Date(borrowing.borrow_date).toLocaleDateString()}</td>
                            <td>{new Date(borrowing.return_date).toLocaleDateString()}</td>
                            <td>{borrowing.actual_return_date ? new Date(borrowing.actual_return_date).toLocaleDateString() : ''}</td>
                            {/* Add more table cells for other borrow details */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default BorrowsTable;
