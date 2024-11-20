import React, { useState, useEffect, useContext } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { useUserContext } from "../../hooks/HeadertextContext";
import { AuthContext } from "../../hooks/AuthContext";
import { toast } from "react-toastify";
import { IoEyeSharp, IoEyeOffSharp } from "react-icons/io5";
import {Link} from "react-router-dom";

export default function Profile() {
  const { setHeaderText } = useUserContext();
  const { allData } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const [employeeDetails, setEmployeeDetails] = useState("");
  const [visible, setVisible] = useState(false);

  const fetchProfileData = async () => {
    try {
      const employeeCollection = collection(db, "users");
      const employeeQuery = query(
        employeeCollection,
        where("role", "==", "employee"),
        where("regId", "==", allData.regId)
      );
      const employeeSnapshot = await getDocs(employeeQuery);
      if (!employeeSnapshot.empty) {
        const employeeData = employeeSnapshot.docs[0].data();
        setEmployeeDetails(employeeData);
      } else {
        toast.error("No employee data found for the current user.");
      }
    } catch (error) {
      toast.error("Error in profile data fetching", error);
    }
  };

  useEffect(() => {
    setHeaderText("Profile");
    fetchProfileData();
  }, [allData.regId]);

  return (
    <div className="profile-container lg2:w-[75%] max-lg2:px-10 mx-auto mt-10">
      <p className="font-semibold text-3xl mb-10 ">Employee Profile</p>
      <div className="md:flex gap-5 mx-auto">
        <div className="shadow p-5 md:w-[35%] w-full ">
          <img
            src="/PngItem_223968.png"
            alt=""
            className="md:w-[80%] rounded-full border-2 mb-5 flex mx-auto"
          />
          {employeeDetails ? (
            <div>
            <h1 className="text-center font-semibold text-xl">{employeeDetails.fullName}</h1>
            <p className="text-center text-sm">{employeeDetails.jobTitle}</p>
            </div>
          ):(
            <p>Loading user data...</p>
          )}
          <div className="border my-5"></div>
          <div className="pl-2 mt-5">
            <p className="font-semibold">Email</p>
            {employeeDetails ? (
              <p className="text-[#75A4EA]">{employeeDetails.email}</p>
            ) : (
              <p>Loading user data...</p>
            )}
          </div>
        </div>
        <div className="w-full shadow p-5 border max-md:mt-5">
          <p className="font-medium text-3xl mb-10 ">Basic Information</p>
          {employeeDetails ? (
            <>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[123px] mr-[33px]">Employee ID:</p>
                <p>{employeeDetails.regId}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[140px] mr-[40px]">Full Name:</p>
                <p>{employeeDetails.fullName}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[120px] mr-[20px]">Father Name:</p>
                <p>{employeeDetails.fatherName}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[104px] mr-[14px]">Phone Number:</p>
                <p>{employeeDetails.phone || "N/A"}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[175px] mr-[85px]">CNIC:</p>
                <p>{employeeDetails.cnic}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[155px] mr-[65px]">Address:</p>
                <p>{employeeDetails.address || "N/A"}</p>
              </div>
              <div className="flex mb-5">
                <p className="text-gray-500 base:mr-[155px] mr-[65px]">Password:</p>
                <div className="md:flex items-center gap-5">
                <p className="">********</p> 
                <Link to="/dashboard/changePassword" className="bg-primary xsm:px-3 px-1 py-1 rounded text-white max-xsm:text-xs">Change Password</Link>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-gray-500">
              Loading user data...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
