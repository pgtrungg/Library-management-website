import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/userSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { current } from '@reduxjs/toolkit';

const Profile = () => {
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = user._id;
  const [formData, setFormData] = useState({
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    axios.get(`/users/${userId}`)
      .then(response => {
        setFormData(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/users/${userId}`, formData)
      .then(response => {
        setFormData(response.data);
        alert('Profile updated successfully');
      })
      .catch(error => console.error('Error updating profile:', error));
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover your account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/users/${userId}`)
          .then(() => {
            Swal.fire(
              'Deleted!',
              'Your account has been deleted.',
              'success'
            );
            dispatch(logout());
            dispatch(clearCart());
            navigate('/login');
          })
          .catch(error => {
            console.error('Error deleting account:', error);
            Swal.fire(
              'Oops!',
              'Something went wrong while deleting your account.',
              'error'
            );
          });
      }
    });
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData._p !== passwordData.confirmNewPassword) {
      Swal.fire('Error', 'New password and confirm password do not match', 'error');
      return;
    }

    axios.patch(`/users/${userId}/password`, passwordData)
      .then(response => {
        Swal.fire('Success', 'Password changed successfully', 'success');
        setIsPasswordModalOpen(false);
      })
      .catch(error => {
        console.error('Error changing password:', error);
        Swal.fire('Error', 'Failed to change password', 'error');
      });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Username:</label>
            <input 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
              disabled 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Name:</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
              required 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Email:</label>
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
              required 
              disabled
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Phone:</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Address:</label>
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Role:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
              disabled
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Status:</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
              required
              disabled
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Avatar URL:</label>
            <input 
              name="avatar" 
              value={formData.avatar} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Date of Birth:</label>
            <input 
              name="date_of_birth" 
              type="date" 
              value={formData.date_of_birth} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
            />
          </div>
          <div className="w-full sm:w-1/2 px-2 mb-4">
            <label className="block text-gray-700">Gender:</label>
            <select 
              name="gender" 
              value={formData.gender} 
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
          Update Profile
        </button>
      </form>
      <div className="mt-4">
        <button 
          onClick={handleChangePassword} 
          className="block w-full px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600 mb-2"
        >
          Change Password
        </button>
        <button 
          onClick={handleDeleteAccount} 
          className="block w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
        >
          Delete Account
        </button>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Current Password:</label>
                <input 
                  type="password" 
                  name="current_password" 
                  value={passwordData.current_password} 
                  onChange={handlePasswordChange} 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">New Password:</label>
                <input 
                  type="password" 
                  name="new_password" 
                  value={passwordData.new_password} 
                  onChange={handlePasswordChange} 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Confirm New Password:</label>
                <input 
                  type="password" 
                  name="confirmNewPassword" 
                  value={passwordData.confirmNewPassword} 
                  onChange={handlePasswordChange} 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" 
                  required 
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="mr-4 px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
