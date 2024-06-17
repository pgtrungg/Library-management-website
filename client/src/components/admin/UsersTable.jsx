import {useState} from "react";
import Select from 'react-select';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {DeleteOutlined} from '@ant-design/icons';
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";


function UsersTable() {
    let [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        recaptcha: ''
    });
    const [isVerified, setIsVerified] = useState(false);

    let [filteredUsers, setFilteredUsers] = useState(
        {
            username: '',
            email: '',
            address: '',
            role: '',
            status: ''
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
        if (filteredUsers.status) {
            let list = filteredUsers.status.map((item) => item.value);
            if ((list.includes('active') && list.includes('inactive')) || list.includes('all')) {
                // do nothing
            } else if (list.includes('active')) {
                query.status = 'active';
            } else if (list.includes('inactive')) {
                query.status = 'inactive';
            }
        }
        return query;
    }

    if (users.length === 0) {
        let query = getQuery();
        axios.get('/users', {params: query})
            .then((response) => {
                    if (response.data.length > 0)
                        setUsers(response.data);
                })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! error: ' + error,
                }).then()
            })
    }

    let filterUsers = () => {
        let query = getQuery();
            axios.get('/users', { params: query })
                .then((response) => {
                    setUsers(response.data);
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong! error: ' + error,
                    }).then()
                })
    }
    const viewDetail = (id) => {
        navigate(`/admin/users/${id}`)
    }
    const removeUser = (id) => {
        setFormData({...formData, userId: id})
        setShowModal(true);
    }
    const handleRecaptchaChange = (token) => {
        setIsVerified(true);
        formData.recaptcha = token;
    }
    const onClickRemove = () => {
        if (isVerified) {
            axios.delete(`/users/admin/${formData.userId}`, {data: formData})
                .then((response) => {
                    console.log(response);
                    Swal.fire({
                        icon: 'success',
                        title: 'User removed'
                    }).then(() => {
                    setShowModal(false);
                    window.location.reload();
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong! error: ' + error,
                    }).then()
                })
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Please verify captcha'
            }).then()
        }
    }



    return (
        <>
            {/* Filter */}
            <>
                <div className="form-control">
                    <input type="text" placeholder="Search by username" className="input input-bordered"
                        value={filteredUsers.username}
                        onChange={(e) => setFilteredUsers({ ...filteredUsers, username: e.target.value })} />
                </div>
                <div className="form-control">
                    <input type="text" placeholder="Search by email" className="input input-bordered"
                        value={filteredUsers.email}
                        onChange={(e) => setFilteredUsers({ ...filteredUsers, email: e.target.value })} />
                </div>
                <div className="form-control">
                    <input type="text" placeholder="Search by address" className="input input-bordered"
                        value={filteredUsers.address}
                        onChange={(e) => setFilteredUsers({ ...filteredUsers, address: e.target.value })} />
                </div>
                <div className="flex w-full">
                    <div className="form-control flex-1 mr-2">
                        <Select
                            value={filteredUsers.role}
                            onChange={(selectedOption) => setFilteredUsers({ ...filteredUsers, role: selectedOption })}
                            options={[
                                { value: 'user', label: 'User' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'all', label: 'All' }
                            ]}
                            className="text-left w-full"
                            classNamePrefix="select"
                        />
                    </div>
                    <div className="form-control flex-1">
                        <Select
                            value={filteredUsers.status}
                            onChange={(selectedOption) => setFilteredUsers({
                                ...filteredUsers,
                                status: selectedOption
                            })}
                            options={[
                                { value: 'active', label: 'active' },
                                { value: 'inactive', label: 'inactive' },
                                { value: 'all', label: 'All' }
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
                            <th>More details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={user.avatar ? user.avatar : 'https://i.pravatar.cc/300'}
                                                    alt="Avatar Tailwind CSS Component" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.username}</div>
                                            <div className="text-sm opacity-50">
                                                {user.status}
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
                                    {user.role}
                                </td>
                                <td>
                                    <button
                                        className="underline hover:text-blue-500"
                                        onClick={() => viewDetail(user._id)}
                                    >
                                        View
                                    </button>

                                </td>
                                <td>
                                    <button onClick={() => removeUser(user._id)}>
                                        <DeleteOutlined />
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                {/* Hiển thị modal và làm mờ nền nếu state showModal là true */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        <div className="bg-white p-8 rounded-lg z-10 w-1/3">
                            <h2 className="text-2xl font-bold mb-4">Verify Captcha</h2>
                            {/* Hiển thị reCAPTCHA trong modal */}
                            <ReCAPTCHA
                                className="mt-3"
                                sitekey="6Ldl-tspAAAAAMFgU-aOT5gkzMZIr0LfFXzgASzK"
                                onChange={handleRecaptchaChange}
                            />
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 mr-4 float-right"
                            >
                                Close
                            </button>
                            <button
                                onClick={onClickRemove}
                                className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 mr-4 float-right"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}



export default UsersTable;