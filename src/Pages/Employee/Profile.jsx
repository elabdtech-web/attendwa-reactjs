import React, { useState, useEffect, useContext } from "react";
import {getAuth,updatePassword,reauthenticateWithCredential,EmailAuthProvider,} from "firebase/auth";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { useUserContext } from "../../hooks/HeadertextContext";
import { AuthContext } from "../../hooks/AuthContext";
import {toast} from "react-toastify"
import CustomInputField from "../../Components/CustomInputField";

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error("Failed to update password.please check the old password.");
    }
    setLoading(false);
  };

  useEffect(() => {
    setHeaderText("Profile");
    fetchProfileData();
  }, [allData.regId]);

  return (
    <div className="profile-container">
      <div className="bg-white p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
          Profile Details
        </h2>
        {employeeDetails ? (
          <div className="py-3 space-y-3 text-left">
            <div className="flex justify-between items-center text-xl text-gray-700">
              <p className="font-medium text-gray-600">Reg No:</p>
              <p className="font-normal text-gray-800">
                {employeeDetails.regId}
              </p>
            </div>
            <div className="flex justify-between items-center text-xl text-gray-700">
              <p className="font-medium text-gray-600">Name:</p>
              <p className="font-normal text-gray-800">
                {employeeDetails.fullName}
              </p>
            </div>
            <div className="flex justify-between items-center text-xl text-gray-700">
              <p className="font-medium text-gray-600">Email:</p>
              <p className="font-normal text-gray-800">
                {employeeDetails.email}
              </p>
            </div>
            <div className="flex justify-between items-center text-xl text-gray-700">
              <p className="font-medium text-gray-600">CNIC:</p>
              <p className="font-normal text-gray-800">
                {employeeDetails.cnic}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">Loading user data...</p>
        )}
      </div>

      <div className="bg-white p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-5 py-4">
          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">
              Old Password :{" "}
            </label>
            <CustomInputField type="password" placeholder="Old Password" name="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required/>
          </div>
          <div className="flex items-center justify-between">
            <label className="block text-gray-600 text-xl font-medium mb-2">
              New Password:
            </label>
            <CustomInputField type="password" placeholder="New Password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
          </div>
          <div className="flex items-center justify-between">
            <label className="block text-gray-600 text-xl font-medium mb-2">
              Confirm New Password:
            </label>
            <CustomInputField type="password" placeholder="Confirm New Password" name="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required/>
          </div>
          {loading ? (
            <div >
              <span className=" bg-gray-800 text-white font-semibold px-6 py-2 rounded">Loading...</span>
            </div>
          ) : (
            <button
              type="submit"
              className=" bg-gray-800 text-white font-semibold px-3 py-2 rounded "
            >
              Update Password
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
