import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const { token } = useParams(); // Assume token is passed via URL parameters
    const navigate = useNavigate();

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirm password is required';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Send form data to the server
        try {
            const response = await axios.post(`auth/reset-password/${token}`, { password: formData.password });
            if (response.status === 200) {
                Swal.fire({
                    title: 'Success',
                    text: 'Your password has been reset successfully. Please log in.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 pt-10 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:border md:mt-0 dark:bg-gray-800 dark:border-gray-700">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center mb-4">
                    Reset Password
                </h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="New password"
                            required
                        />
                        {errors.password && <span className="text-red-500">{errors.password}</span>}
                    </div>
                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Confirm new password"
                            required
                        />
                        {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword}</span>}
                    </div>
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                        Reset Password
                    </button>
                    
                </form>
                
            </div>
            
        </section>
    );
};

export default ResetPassword;
