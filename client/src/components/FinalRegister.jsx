import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FinalRegister = () => {
    const { status } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (status === "success") {
            Swal.fire({
                title: "Success",
                text: "You have successfully registered",
                icon: "success",
                confirmButtonText: "OK"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        } else if (status === "failed") {
            Swal.fire({
                title: "Failed",
                text: "An error occurred while registering",
                icon: "error",
                confirmButtonText: "Try Again"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/signup");
                }
            });
        }
    }, [status, navigate]);

    return (
        <div className="h-screen flex justify-center items-center"></div>
    );
};

export default FinalRegister;
