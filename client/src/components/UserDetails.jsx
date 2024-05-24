import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserDetails = () => {
  const { userId } = useParams(); // Assumes you're using react-router-dom for route parameters
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    status: '',
    avatar: '',
    date_of_birth: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios.get(`/users/${userId}`)
      .then(response => {
        setUserData(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/users/${userId}`, userData)
      .then(response => {
        setUserData(response.data);
        setIsEditing(false);
        Swal.fire('Success', 'Profile updated successfully', 'success');
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        Swal.fire('Error', 'Failed to update profile', 'error');
      });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-md">
      <div className="flex items-center">
        <div className="-mt-2 -ml-2">
          <img src={userData.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-bold">{userData.username}</h2>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-bold mb-4">User Details</h1>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Name:</label>
                <input
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Phone:</label>
                <input
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Address:</label>
                <input
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Role:</label>
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Status:</label>
                <select
                  name="status"
                  value={userData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Date of Birth:</label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={userData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700">Gender:</label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap -mx-2">
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Name:</label>
              <p className="px-3 py-2 border rounded-md">{userData.name}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Phone:</label>
              <p className="px-3 py-2 border rounded-md">{userData.phone}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Address:</label>
              <p className="px-3 py-2 border rounded-md">{userData.address}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Role:</label>
              <p className="px-3 py-2 border rounded-md">{userData.role}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Status:</label>
              <p className="px-3 py-2 border rounded-md">{userData.status}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Date of Birth:</label>
              <p className="px-3 py-2 border rounded-md">{new Date(userData.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Gender:</label>
              <p className="px-3 py-2 border rounded-md">{userData.gender}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
