import React,{useContext,useState,useEffect} from 'react'
import {AuthContext} from "../../hooks/AuthContext";
import {Link} from "react-router-dom"
import { FiMenu, FiUser } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { collection, getDocs, query, where } from "firebase/firestore";
import {db} from "../../Firebase/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function HeaderPart() {
    const [isDropdownOpen, setIsDropdownOpen] = useState("");
    const [loading, setLoading] = useState(false);
    const {setUserType,allData,setAllData,userType} = useContext(AuthContext);
    const navigate = useNavigate();
    const toggleDropdown = () => {
        console.log(auth.currentUser);
        setIsDropdownOpen(!isDropdownOpen);
    };
    const fetchUserRole = async () => {
        const email = auth.currentUser?.email
        console.log(email)
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setAllData(userData);
          setUserType(userData.role)
        } 
        if (snapshot.empty) {
          toast.error("No user found with this email.");
        }
      };
      
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setLoading(true);
            try {
                await fetchUserRole(currentUser.email);
              
            } catch (error) {
                console.log(error)
                
            } finally{
                setLoading(false)
            }
              
            } 
          });
          return () => unsubscribe();
    }, []);
    const handleLogout = () => {
        signOut(auth);
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("userEmail")    
        setUserType(null);
        setAllData(null);
        navigate("/login");
        toast.success("Logout Successfully");
    };
  return (
    <div>
      <div className="relative flex justify-end">
        <div className="flex ">
        {loading?(
            <p className="font-semibold text-white">Loading....</p>
        ):(
            <p className="font-semibold text-white">{allData.fullName}</p>
        )}
      
        <button
          onClick={toggleDropdown}
          className="flex items-center text-xl xsm:ml-4 ml-2 xsm:mr-5"
        >
          <FiUser className="text-gray-400" /> 
          <IoMdArrowDropdown className="text-gray-400" />
        </button>
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-10 mr-5 w-60 bg-white border rounded shadow-lg p-5 z-50">
            <div className="text-left mb-2 px-1 ">
              <p className="font-semibold">{allData.fullName}</p>
              <p className="text-sm text-gray-600">{allData.email}</p>
            </div>
            <ul>
            <li className="px-1 py-2 hover:bg-gray-100 cursor-pointer">
              <Link to="/dashboard">
              Dashboard
            </Link>
              </li>
              <li className="px-1 py-2 hover:bg-gray-100 cursor-pointer">
              <Link to="/dashboard/profile">
              Profile
            </Link>
              </li>
              <li
                className="px-1 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
