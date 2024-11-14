import React, { useState,useEffect ,useContext,useRef} from "react";
import {Link} from "react-router-dom"
import { FiMenu, FiUser } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/FirebaseConfig";
import { useUserContext } from "../../hooks/HeadertextContext";
import { AuthContext } from "../../hooks/AuthContext";
import Profile from "../../Pages/Employee/Profile";
import { toast } from "react-toastify";

export default function HeaderDashboard({
  toggleSidebar,
  isSidebarOpen,
  text,
  fullName,
  email,
}) {
  const catMenu = useRef(null)
  const {setUserType,setAllData} = useContext(AuthContext)
  const [isDropdownOpen, setIsDropdownOpen] = useState("");
   const navigate = useNavigate();
  const {headerText} = useUserContext()
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
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
    <div className="bg-white shadow p-4 flex justify-between items-center">
      {!isSidebarOpen && (
        <button onClick={toggleSidebar} className="text-2xl mr-4">
          <FiMenu />
        </button>
      )}
      <h1 className="text-2xl font-semibold">{headerText}</h1>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-xl ml-4"
        >
          <FiUser /> 
          <IoMdArrowDropdown className="ml-1" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg p-2 z-50">
            <div className="text-left mb-2 px-1">
              <p className="font-semibold">{fullName}</p>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
            <ul>
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
  );
}
