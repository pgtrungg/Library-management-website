import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gửi email đến API để xử lý reset mật khẩu
        try {
            const response = await axios.post('auth/forgot-password', { email });
            if (response.status === 200) {
                Swal.fire({
                    title: 'Success',
                    text: 'A reset password link has been sent to your email.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                }
                );
            }
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 pt-0 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:border md:mt-0 dark:bg-gray-800 dark:border-gray-700">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center mb-4">
                    Reset password
                </h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Your email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="name@company.com"
                            required
                        />
                        {errorMessage && <span className="text-red-500">{errorMessage}</span>}
                    </div>
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                        Send Reset Link
                    </button>
                </form>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                    Remember your password?{" "}
                    <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                        Log in
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default ForgotPassword;
