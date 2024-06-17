import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const VerifyResult = () => {
    const { status, message } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        // url decode the message
        const decodedMessage = decodeURIComponent(message);
        if (status === "success") {
            Swal.fire({
                title: "Success",
                text: decodedMessage,
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
                text: decodedMessage,
                icon: "error",
                confirmButtonText: "Try Again"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/signup");
                }
            });
        }
    }, [message, status, navigate]);

    return (
        <div className="h-screen flex justify-center items-center"></div>
    );
};

export default VerifyResult;
