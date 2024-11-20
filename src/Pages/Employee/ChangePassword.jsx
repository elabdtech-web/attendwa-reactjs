import React, { useState } from "react";
import CustomInputField from "../../Components/CustomInputField";
import { toast } from "react-toastify";
import { IoEyeSharp, IoEyeOffSharp } from "react-icons/io5";
import {
    getAuth,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
  } from "firebase/auth";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const [employeeDetails, setEmployeeDetails] = useState("");
  const [visible, setVisible] = useState(false);
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
          toast.error("Password is not changed");
        }
        setLoading(false);
      };
    
  return (
    <div className="bg-white p-6 m-6  max-w-4xl lg:mx-auto">
      <h2 className="py-3 text-2xl font-semibold">
        Update Password
      </h2>
      <form onSubmit={handlePasswordChange} className="space-y-5 py-4">
      <div className="leading-10">
      <label className=" text-md font-medium mb-2">
            Old Password :{" "}
          </label>
          <div className="w-[400px] relative">
            <CustomInputField
              type={visible ? "text" : "password"}
              placeholder="Old Password"
              name="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <div
              className="absolute top-[30%] left-[90%]"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </div>
          </div>
        </div>
        <div className="leading-10">
        <label className=" text-md font-medium mb-2">
            New Password:
          </label>
          <div className="w-[400px] relative">
            <CustomInputField
              type={visible ? "text" : "password"}
              placeholder="New Password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div
              className="absolute top-[30%] left-[90%]"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </div>
          </div>
        </div>
        <div className="leading-10">
          <label className=" text-md font-medium mb-2">
            Confirm New Password:
          </label>
          <div className="w-[400px] relative">
            <CustomInputField
              type={visible ? "text" : "password"}
              placeholder="Confirm New Password"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <div
              className="absolute top-[30%] left-[90%]"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </div>
          </div>
        </div>
        <div className="flex gap-12">
        {loading ? (
          <div>
            <span className=" bg-primary text-white font-semibold px-6 py-2 rounded">
              Loading...
            </span>
          </div>
        ) : (
          <button
            type="submit"
            className=" bg-primary text-white font-semibold px-3 py-2 rounded "
          >
            Update Password
          </button>
        )}
        <div>
        <button className=" text-gray-500 border border-gray-300 font-semibold px-12 py-2 rounded" onClick={() => window.history.back()}>Cancel</button>
        </div>
        </div>
      </form>
    </div>
  );
}
