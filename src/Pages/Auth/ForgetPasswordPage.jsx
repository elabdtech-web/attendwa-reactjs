import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Firebase/FirebaseConfig";
import CustomInputField from "../../Components/CustomInputField";
import { toast } from "react-toastify";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!email) {
      toast.error("Please enter your email address");
      setLoading(false);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent! Please check your email.");
      setLoading(false);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email. Please check and try again.");
      }
      
      if (error.code === "auth/invalid-email") {
        toast.error("The email address is not valid. Please enter a valid email.");
      }
      if (error.code !=="auth/user-not-found" && error.code !=="auth/invalid-email") {
        toast.error("Failed to send reset link. Please try again later.");
      }
      setLoading(false);
    }
  };
  

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="shadow rounded-lg max-w-[500px] w-full p-10 bg-white">
        <form onSubmit={handleResetPassword}>
          <div className="pb-3">
            <h1 className="font-semibold text-2xl">ATTENDWA</h1>
            <p className="font-medium text-md">Reset your password</p>
          </div>
          <div className="items-center">
            <div className="pb-4">
              <label htmlFor="email" className="text-md pb-2 leading-8">
                Email
              </label>
              <CustomInputField
                type="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            {loading ? (
              <div className="text-white text-center bg-primary rounded px-4 w-full py-2">
                Loading...
              </div>
            ) : (
              <button
                className="text-white bg-primary rounded px-4 w-full py-2"
                type="submit"
              >
                Send Reset Link
              </button>
            )}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-gray-600 text-sm"
              >
                Back to Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
