import {useState} from "react";
import Select from 'react-select';
import axios from "axios";

function UsersTable() {
    let [users, setUsers] = useState([]);

    let [filteredUsers, setFilteredUsers] = useState(
        {
            username: '',
            email: '',
            address: '',
            role: '',
            isVerified: ''
        }
    );

    const getQuery = () => {
        let query = {};
        if (filteredUsers.username) {
            query.username = filteredUsers.username;
        }
        if (filteredUsers.email) {
            query.email = filteredUsers.email;
        }
        if (filteredUsers.address) {
            query.address = filteredUsers.address;
        }
        if (filteredUsers.role) {
            let role = filteredUsers.role.value;
            if (role !== 'all') {
                query.role = role;
            }
        }
        if (filteredUsers.isVerified) {
            let list = filteredUsers.isVerified.map((item) => item.value);
            if ((list.includes('verified') && list.includes('not-verified')) || list.includes('all')) {
                // do nothing
            } else if (list.includes('verified')) {
                query.isVerified = true;
            } else if (list.includes('not-verified')) {
                query.isVerified = false;
            }
        }
        return query;
    }

    if (users.length === 0) {
        let query = getQuery();
        try {
            axios.get('user/gets', {params: query})
                .then((response) => {
                    if (response.data.length > 0)
                        setUsers(response.data);
                });
        } catch (error) {
            console.error(error);
        }
    }

    let filterUsers = () => {
        let query = getQuery();
        try {
            axios.get('user/gets', {params: query})
                .then((response) => {
                    setUsers(response.data);
                });
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            {/* Filter */}
            <>
                <div className="form-control">
                    <input type="text" placeholder="Search by username" className="input input-bordered"
                           value={filteredUsers.username}
                           onChange={(e) => setFilteredUsers({...filteredUsers, username: e.target.value})}/>
                </div>
                <div className="form-control">
                    <input type="text" placeholder="Search by email" className="input input-bordered"
                           value={filteredUsers.email}
                           onChange={(e) => setFilteredUsers({...filteredUsers, email: e.target.value})}/>
                </div>
                <div className="form-control">
                    <input type="text" placeholder="Search by address" className="input input-bordered"
                           value={filteredUsers.address}
                           onChange={(e) => setFilteredUsers({...filteredUsers, address: e.target.value})}/>
                </div>
                <div className="flex w-full">
                    <div className="form-control flex-1 mr-2">
                        <Select
                            value={filteredUsers.role}
                            onChange={(selectedOption) => setFilteredUsers({...filteredUsers, role: selectedOption})}
                            options={[
                                {value: 'manager', label: 'Manager'},
                                {value: 'user', label: 'User'},
                                {value: 'admin', label: 'Admin'},
                                {value: 'all', label: 'All'}
                            ]}
                            className="text-left w-full"
                            classNamePrefix="select"
                        />
                    </div>
                    <div className="form-control flex-1">
                        <Select
                            value={filteredUsers.isVerified}
                            onChange={(selectedOption) => setFilteredUsers({
                                ...filteredUsers,
                                isVerified: selectedOption
                            })}
                            options={[
                                {value: 'verified', label: 'Verified'},
                                {value: 'not-verified', label: 'Not Verified'},
                                {value: 'all', label: 'All'}
                            ]}
                            className="text-left w-full"
                            classNamePrefix="select"
                            isMulti
                        />
                    </div>
                </div>
                {/*Submit Filter*/}
                <div className="form-control">
                    <button className="btn btn-primary" onClick={filterUsers}>
                        Filter
                    </button>
                </div>

            </>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        {/*is Verify*/}
                        <th>User Name</th>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.userId}>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle w-12 h-12">
                                            <img src={'https://picsum.photos/200/300'}
                                                 alt="Avatar Tailwind CSS Component"/>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">{user.username}</div>
                                        <div className="text-sm opacity-50">
                                            {user.isVerified ? 'Verified' : 'Not Verified'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>{user._id}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.address ? user.address : <strong>N/A</strong>}
                            </td>
                            <td>
                                {user.adminRole ? 'Admin' : user.managerRole ? 'Manager' : 'User'}
                            </td>
                            <td>
                                <button className="btn btn-ghost btn-xs">details</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default UsersTable;