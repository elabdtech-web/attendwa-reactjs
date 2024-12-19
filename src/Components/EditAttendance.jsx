import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import {toast} from "react-toastify";
import CustomInputField from "../Components/CustomInputField"

const EditAttendance = ({ attendanceId, closeEdit }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [status, setStatus] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const docRef = doc(db, "checkIns", attendanceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAttendanceData(data);
        setStatus(data.status || "");

        if (data.checkInTime instanceof Timestamp) {
          const checkInDate = data.checkInTime.toDate();
          const adjustedCheckInDate = new Date(checkInDate.getTime() + 5 * 60 * 60 * 1000); 
          setCheckInTime(adjustedCheckInDate.toISOString().slice(11, 16)); 
        } 
        if (!data.checkInTime) {
          setCheckInTime(""); 
        }
    
        if (data.checkOutTime instanceof Timestamp) {
          const checkOutDate = data.checkOutTime.toDate(); 
          const adjustedCheckOutDate = new Date(checkOutDate.getTime() + 5 * 60 * 60 * 1000); 
          setCheckOutTime(adjustedCheckOutDate.toISOString().slice(11, 16));
        } 
        if (!data.checkOutTime) {
          setCheckOutTime(""); 
        }
        setDate(data.date || "");
      } 
      if (!docSnap.exists()) {
        toast.error("No such document!");
      }
    };

    fetchAttendanceData();
  }, [attendanceId]);

  const handleSave = async () => {
    setLoading(true);
    const docRef = doc(db, "checkIns", attendanceId);
  
    if (!date || !status) {
      toast.warning("Please Fill Date and Status.");
      return;
    }
    if (status === "present" && (!checkInTime || !checkOutTime)) {
      toast.warning("Please select check-in and check-out times.");
      return;
    }
    
  
    let finalCheckInTime = checkInTime ? new Date(`${date}T${checkInTime}:00`) : null;
    let finalCheckOutTime = checkOutTime ? new Date(`${date}T${checkOutTime}:00`) : null;

    if (finalCheckInTime && finalCheckOutTime && finalCheckOutTime <= finalCheckInTime) {
      toast.warning("Check-out time must be greater than check-in time.");
      return;
    }
    
    let checkInTimestamp = finalCheckInTime && !isNaN(finalCheckInTime) ? Timestamp.fromDate(finalCheckInTime) : null;
    let checkOutTimestamp = finalCheckOutTime && !isNaN(finalCheckOutTime) ? Timestamp.fromDate(finalCheckOutTime) : null;
    
    let totalWorkingHours = null;
    if (checkInTimestamp && checkOutTimestamp) {
      const totalWorkingMilliseconds = checkOutTimestamp.toMillis() - checkInTimestamp.toMillis();
      totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s
      `;
    }
    if (status === "home") {
      totalWorkingHours = "8h 0m 0s";
      finalCheckInTime = new Date(`${date}T10:00:00`);
      finalCheckOutTime = new Date(`${date}T18:00:00`);
    }
    if (status === "holiday" || status === "leave" || status === "absent") {
      totalWorkingHours = null;
      finalCheckInTime = null;
      finalCheckOutTime = null;
    }
    const updatedData = {
      status: status,
      checkInTime: finalCheckInTime ? Timestamp.fromDate(finalCheckInTime) : null,
      checkOutTime: finalCheckOutTime ? Timestamp.fromDate(finalCheckOutTime) : null,
      totalWorkingHours: totalWorkingHours, 
    };
    try {
      await updateDoc(docRef, updatedData);
      window.location.reload();
      closeEdit(); 
    
    } catch (error) {
      toast.error("Error updating document:", error);
    }
    setLoading(false);
  };

  if (!attendanceData) return <p>Loading...</p>;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto bg-white">
      <div className="modal-content">
        <h3 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
          Edit Attendance
        </h3>
        <form className="space-y-5 py-4">
          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="px-1 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary w-[300px]"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="home">Work From Home</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Check-In Time:</label>
            <div className="w-[300px]">
            <CustomInputField type="time" name="checkInTime" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} readOnly={status === "home"|| status === "holiday" || status === "leave" || status === "absent"}/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Check-Out Time:</label>
            <div className="w-[300px]">
            <CustomInputField type="time" name="checkOutTime" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)}  readOnly={status === "home"|| status === "holiday" || status === "leave" || status === "absent"}/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Date:</label>
            <div className="w-[300px]">
            <CustomInputField type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} max={today}/>
              </div>
          </div>

          <div className="flex justify-between gap-4">
           {loading ? (
             <button
             type="button"
             className="bg-primary text-white font-semibold px-4 py-2 rounded-lg w-full"
           >
             Loading
           </button>
           ) : (
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary text-white font-semibold px-4 py-2 rounded-lg w-full"
            >
              Save Changes
            </button>
           )}
            <button
              type="button"
              onClick={closeEdit}
              className="border border-gray-400 font-semibold px-4 py-2 rounded-lg w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendance;
