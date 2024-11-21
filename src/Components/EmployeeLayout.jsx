import React, { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Dashboard/EmployeeSidebar";
import HeaderDashboard from "../Components/Dashboard/HeaderDashboard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../Firebase/FirebaseConfig";
import UserContext from "../hooks/HeadertextContext";
import { AuthContext } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

export default function EmployeeLayout() {
  const [loading, setLoading] = useState(true);
  const { userType, setUserType } = useContext(AuthContext);
  const { allData,setAllData} = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fetchUserRole = async (email) => {
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
    const access_token = localStorage.getItem("accesstoken");
    if (!access_token) {
      navigate("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchUserRole(currentUser.email);
        setLoading(false);
      } else {
        navigate("/login");
      }
    });

    setLoading(false)
    return () => unsubscribe();
  }, []);
  
  if (userType === "admin"){
        navigate("/a-dashboard")
   } 
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <p>LOADING</p>;
  }

  return (
    <UserContext>
      <div className="flex">
        {isSidebarOpen && <Sidebar toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>}
        <div className="flex-1">
          <HeaderDashboard
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            text={"Employees"}
            fullName={allData.fullName}
            email={allData.email}
          />
          <Outlet />
        </div>
      </div>
    </UserContext>
  );
}
