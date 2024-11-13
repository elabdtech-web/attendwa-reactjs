import React, { useState, useEffect, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../Firebase/FirebaseConfig";
import { AuthContext } from "../../hooks/AuthContext";
import CustomInputField from "../../Components/CustomInputField";

const Login = () => {
  const { userType, setUserType, allData, setAllData } =
    useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles login form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if email and password are filled
    if (!email || !password) {
      setErr("Please fill both fields");
      return;
    }
    // Set Loading
    setLoading(true);
    // Login Function Call
    try {
      // Login with email and password from firebase
      const response = await signInWithEmailAndPassword(auth, email, password);
      // Check if response is not null
      if (response) {
        const accessToken = await response.user.getIdToken();
        localStorage.setItem("accesstoken", accessToken);
        localStorage.setItem("userEmail", email);
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          // If user is admin
          if (userData.role === "admin") {
            setUserType("admin");
            setAllData(userData);
            console.log("Admin is login");
            // Flash message
            navigate("/a-dashboard");
          }

          // If user is employee
          if (userData.role === "employee") {
            setUserType("employee");
            setAllData(userData);
            console.log("Employee is login");
            // Flash message
            navigate("/dashboard");
          }

          // Unable to find role
          // Logout user with error flash message
          setErr("No valid role found for the user.");
        } else {
          // No User found
          setErr("No user found with this email.");
        }
      }
    } catch (error) {
      setErr("Your Credentials are Incorrect");
    }
    setLoading(false);
  };
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accesstoken");
    if (storedAccessToken) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="h-screen flex justify-center items-center">
      {/* Login Form */}
      <div className="shadow rounded-lg max-w-[500px] w-full p-10 bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="pb-3">
            <h1 className="font-semibold text-2xl">ATTENDWA</h1>
            {/* Add logo here */}
            <p className="font-medium text-md">Please login to continue</p>
          </div>
          {/* Text Fields */}
          <div className="items-center">
            <div className="pb-4">
              {/* Email */}
              <div className="mb-2">
                <label htmlFor="email" className="text-md pb-2">
                  Email
                </label>
                <CustomInputField
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErr("");
                  }}
                />
              </div>
              {/* Password */}
              <div className="mb-2">
                <label htmlFor="password" className="mb-2">
                  Password
                </label>
                <CustomInputField
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErr("");
                  }}
                />
              </div>
              {/* Forget Password */}
              <div className="text-right">
                <a href="#" className="text-gray-600 text-sm">
                  Forget Password?
                </a>
              </div>
            </div>
            {/* Button */}
            {err && <p className="text-red-500 mb-4">{err}</p>}
            {/* Set Loading */}
            {loading ? (
              <div className="text-white text-center bg-primary rounded px-4 w-full py-2">
                {/* Loading */}
                Loading...
              </div>
            ) : (
              <div className="">
                {/* Login */}
                <button
                  className="text-white bg-primary rounded px-4 w-full py-2"
                  type="submit"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
