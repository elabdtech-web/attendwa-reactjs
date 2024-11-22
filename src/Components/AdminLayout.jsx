import React, { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Dashboard/AdminSidebar";
import HeaderDashboard from "../Components/Dashboard/HeaderDashboard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../Firebase/FirebaseConfig";
import UserContext from "../hooks/HeadertextContext";
import { AuthContext } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const [loading, setLoading] = useState(false);
  const { userType, setUserType } = useContext(AuthContext);
  const { allData,setAllData} = useContext(AuthContext)
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    }

    if (access_token && !userType) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await fetchUserRole(currentUser.email);
          setLoading(false);
          if (userType==="employee"){
            navigate("/dashboard")
          }
        } 
        if (!currentUser) {
          navigate("/login");
        }
      });

      return () => unsubscribe();
    }
    setLoading(false)
  }, [navigate]);

  useEffect(()=>{
    if (userType === "employee"){
        navigate("/dashboard")
      } 
  },[userType])
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <p className="flex justify-center items-center h-screen text-xl">LOADING ..</p>;
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
