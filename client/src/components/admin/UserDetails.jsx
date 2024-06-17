import {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';

const UserDetails = () => {
  const { userId } = useParams(); // Assumes you're using react-router-dom for route parameters
  const recaptchaRef = useRef(null);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    status: '',
    recaptcha: ''
  });
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'user', // Default role to 'user'
    status: 'active', // Default status to 'active'
    avatar: '',
    date_of_birth: '',
    gender: '',
    join_date: '',
    last_login: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios.get(`/users/admin/${userId}`)
      .then(response => {
        setUserData(response.data);
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
    setUserData({
      ...userData,
      [name]: value
    });
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      recaptchaRef.current.reset();
      return;
    }

    try {
      const response = await axios.put(`/users/admin/${userId}`, formData);
      setUserData(response.data);
      setIsEditing(false);
      setIsVerified(false);
      Swal.fire('Success', 'Status and role updated successfully', 'success').then()
    } catch (error) {
      setIsVerified(false);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! error: ' + error,
      }).then()
    }
  };

  const handleRecaptchaChange = (value) => {
    setFormData({
      ...formData,
      recaptcha: value
    });
    setIsVerified(!!value);
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
                <label className="block text-gray-700" htmlFor="status">Status:</label>
                <select
                    id="status"
                  name="status"
                  value={userData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="w-full sm:w-1/2 px-2 mb-4">
                <label className="block text-gray-700" htmlFor="role">Role:</label>
                <select
                    id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <ReCAPTCHA
              ref={recaptchaRef}
              className="mt-3"
              sitekey="6Ldl-tspAAAAAMFgU-aOT5gkzMZIr0LfFXzgASzK"
              onChange={handleRecaptchaChange}
            />
            {isVerified && (
                <>
                  <p className="text-red-500">Please verify you are human</p>
                  <button
                      type="submit"
                      className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </>
            )}

          </form>
        ) : (
            <div className="flex flex-wrap -mx-2">
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Name:</label>
              <p className="px-3 py-2 border rounded-md">{userData.name ? userData.name : 'Not specified'}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Phone:</label>
              <p className="px-3 py-2 border rounded-md">{userData.phone ? userData.phone : 'Not specified'}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Address:</label>
              <p className="px-3 py-2 border rounded-md">{userData.address ? userData.address : 'Not specified'}</p>
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
              <p className="px-3 py-2 border rounded-md">{userData.date_of_birth ? userData.date_of_birth : 'Not specified'}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Gender:</label>
              <p className="px-3 py-2 border rounded-md">{userData.gender ? userData.gender : 'Not specified'}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Join Date:</label>
              <p className="px-3 py-2 border rounded-md">{userData.join_date}</p>
            </div>
            <div className="w-full sm:w-1/2 px-2 mb-4">
              <label className="block text-gray-700">Last Login:</label>
              <p className="px-3 py-2 border rounded-md">{userData.last_login ? userData.last_login : 'Not specified'}</p>
            </div>
          </div>
        )}
      </div>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Edit Status and Role
        </button>
      )}
    </div>
  );
};

export default UserDetails;
