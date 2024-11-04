import React, { useState, useEffect, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db,auth } from "../../Firebase/FirebaseConfig";
import { AuthContext } from "../../hooks/AuthContext";

const Login = () => {
  const { userType, setUserType, allData,setAllData} = useContext(AuthContext);
  const [email, setEmail] =useState("")
  const [password, setPassword] = useState("");
  const [eror, setEror] = useState("");
  const [err,setErr] =useState("")
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setEror("Please fill both fields");
      return;
    }
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      if (response) {
        const accessToken = await response.user.getIdToken();
        localStorage.setItem("accesstoken", accessToken);
        localStorage.setItem("userEmail", email);
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          if (userData.role === "admin") {
            setUserType("admin");
            setAllData(userData);
            console.log("Admin is login");
            navigate("/a-dashboard");
          } else if (userData.role === "employee") {
            console.log(userData)
            setUserType("employee");
            setAllData(userData)
            console.log("Employee is login");
            navigate("/dashboard");
          } else {
           console.error("No valid role found for the user.");
          }
        } else {
         console.error("No user found with this email.");
        }
      } 
    } catch (error) {
       setErr("Your Credentials are Incorrect")
    } 
    setLoading(false);
    
  };
  useEffect(()=>{
    const storedAccessToken = localStorage.getItem("accesstoken");
    if (storedAccessToken){
       navigate("/dashboard")
    }
    else{
      navigate("/login")
    }
  },[navigate]);

  return (
    <div className="h-screen flex justify-center items-center bg-[#FFFFFF]">
      <form
        onSubmit={handleSubmit}
        className="shadow py-[3%] rounded-lg w-[40%]"
      >
        <h1 className="font-semibold text-2xl w-[60%] mx-auto px-2 pb-[10px]">ATTENDWA</h1>
        <p className="font-medium text-lg w-[60%] mx-auto px-2 pb-[20px]">Please login to continue</p>
        <div className="flex flex-col items-center">
          <div className="mb-2 w-[60%]">
            <label htmlFor="email" className="block mb-2 text-gray-700 px-2">
              Email
            </label>
            <input
              type="email" 
              id="email"
              value={email || ""}
              onChange={(e) =>{ setEmail(e.target.value)
                setErr("")
                setEror("")
              }
            }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-[20px] w-[60%]">
            <label htmlFor="password" className="block mb-2 text-gray-700 px-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) =>{ setPassword(e.target.value)
                setErr("")
                setEror("")
              }}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your password"
            />
          </div>
          {eror && <p className="text-red-500 mb-4">{eror}</p>}
          {err && <p className="text-red-500 mb-4">{err}</p>}
          {loading ? (
            <div className="w-[20%] flex items-center justify-center text-white bg-gray-600 rounded px-[35px] pt-[6px] pb-[8px] text-[15px]">
              <span>Loading...</span> 
            </div>
          ) : (
            <div className="w-[20%] flex items-center justify-center text-white bg-black rounded px-[35px] pt-[6px] pb-[8px] text-[15px]">
              <button type="submit">Login</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
