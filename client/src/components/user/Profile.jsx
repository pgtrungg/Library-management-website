import { useState, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/userSlice.jsx';
import { clearCart } from '../../redux/slices/cartSlice.jsx';
import ReCAPTCHA from "react-google-recaptcha";

const Profile = () => {
  const user = useSelector((state) => state.user);
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

  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: '',
    recaptcha: ''
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
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! error: ' + error,
        }).then()
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
      .catch(error =>
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! error: ' + error,
          }).then());
  };

  const handleDeleteAccount = () => {
    setDeleteAccountData({
        password: '',
        recaptcha: ''
    })
    setDeleteAccountModal(true);
  };

  const submitDeleteAccount = (e) => {
    e.preventDefault();
    axios.delete(`/users/${userId}`, {
      data: deleteAccountData
    })
      .then(() => {
        Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
        dispatch(logout());
        dispatch(clearCart());
        navigate('/login');
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! error: ' + error,
        }).then()
      });
  }
  



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
  const handleChangeAvatar = (e) => {
    const file = e.target.files[0]; // Lấy file ảnh từ input
    const formData = new FormData();
    formData.append('avatar', file); // Thêm file ảnh vào FormData
  
    // Gửi yêu cầu tải lên ảnh avatar lên máy chủ
    axios.patch(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      Swal.fire('Success', 'Avatar uploaded successfully', 'success').then(() => {
        setFormData({
          ...formData,
          avatar: response.data.avatar
        });
      }
      );
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! error: ' + error,
      }).then()
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirmNewPassword) {
      Swal.fire('Error', 'New password and confirm password do not match', 'error');
      return;
    }

    axios.patch(`/users/${userId}/password`, {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    })
      .then( () => {
        Swal.fire('Success', 'Password changed successfully', 'success').then();
        setIsPasswordModalOpen(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirmNewPassword: ''
        });
      })
      .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! error: ' + error,
        }).then()
      });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
      <>
        <div>
          <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-md flex">
            <div className="flex items-center">
              <div className="-mt-2 -ml-2">
                <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full"/>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{formData.username}</h2>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeAvatar}
                  className="hidden"
                  id="avatarInput"
              />


              <button
                  onClick={() => document.getElementById('avatarInput').click()}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mr-4"
              >
                Change Avatar
              </button>
              <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mr-4">
                Change Password
              </button>
              <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">
                Delete Account
              </button>
            </div>
          </div>


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
          </div>
          {isPasswordModalOpen && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                  <div
                      className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">

                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">

                          <div className="mt-2">
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                              <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                  Current Password
                                </label>
                                <input
                                    type="password"
                                    name="current_password"
                                    id="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    autoComplete="current-password"
                                    placeholder="Enter current password"
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                                  New Password
                                </label>
                                <input
                                    type="password"
                                    name="new_password"
                                    id="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                                  Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    id="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Change Password
                                </button>
                                <button
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    type="button"
                                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>


                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
        <div>
          {/* Hiển thị modal và làm mờ nền nếu state showModal là true */}
          {deleteAccountModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <div
                        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">

                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">

                            <div className="mt-2">
                              <form onSubmit={submitDeleteAccount} className="space-y-6">
                                <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                  </label>
                                  <input
                                      type="password"
                                      name="password"
                                      id="password"
                                      value={deleteAccountData.password}
                                      onChange={(e) => setDeleteAccountData({...deleteAccountData, password: e.target.value})}
                                      autoComplete="current-password"
                                      placeholder="Enter your password"
                                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2"
                                  />
                                </div>
                                <div>
                                  <ReCAPTCHA
                                      className="mt-3"
                                      sitekey="6Ldl-tspAAAAAMFgU-aOT5gkzMZIr0LfFXzgASzK"
                                      onChange={(value) => setDeleteAccountData({...deleteAccountData, recaptcha: value})}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                      type="submit"
                                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red border border-transparent rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                    Delete Account
                                    </button>
                                    <button
                                      onClick={() => setDeleteAccountModal(false)}
                                      type="button"
                                      className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )
          }
        </div>
      </>


  );
}


export default Profile;
