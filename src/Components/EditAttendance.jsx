import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

const EditAttendance = ({ attendanceId, closeEdit }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [status, setStatus] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const docRef = doc(db, "checkIns", attendanceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAttendanceData(data);
        setStatus(data.status || "");

        if (data.checkInTime && data.checkInTime !== "N/A") {
          console.log("sdfdsf",data.checkInTime)
          const checkInDate = data.checkInTime.toDate();
          const adjustedCheckInDate = new Date(checkInDate.getTime() + 5 * 60 * 60 * 1000); 
          const formattedCheckInTime = adjustedCheckInDate.toISOString().slice(11, 16); 
          setCheckInTime(formattedCheckInTime); 
        } else {
          setCheckInTime(""); 
        }
    
        if (data.checkOutTime) {
          const checkOutDate = data.checkOutTime.toDate(); 
          const adjustedCheckOutDate = new Date(checkOutDate.getTime() + 5 * 60 * 60 * 1000); 
          const formattedCheckOutTime = adjustedCheckOutDate.toISOString().slice(11, 16); 
          setCheckOutTime(formattedCheckOutTime);
        } else {
          setCheckOutTime(""); 
        }
        setDate(data.date || "");
      } else {
        console.log("No such document!");
      }
    };

    fetchAttendanceData();
  }, [attendanceId]);

  const handleSave = async () => {
    const docRef = doc(db, "checkIns", attendanceId);
  
    if (!date) {
      alert("Please fill in the date");
      return;
    }
  
    let finalCheckInTime = checkInTime ? new Date(`${date}T${checkInTime}:00`) : "N/A";
    let finalCheckOutTime = checkOutTime ? new Date(`${date}T${checkOutTime}:00`) : "N/A";
  
    let checkInTimestamp = null;
    let checkOutTimestamp = null;
  
    if (finalCheckInTime !== "N/A" && !isNaN(finalCheckInTime)) {
      checkInTimestamp = Timestamp.fromDate(finalCheckInTime);
    } else {
      finalCheckInTime = "N/A";
    }
  
    if (finalCheckOutTime !== "N/A" && !isNaN(finalCheckOutTime)) {
      checkOutTimestamp = Timestamp.fromDate(finalCheckOutTime);
    } else {
        finalCheckOutTime = "N/A";
    }
  
    let totalWorkingHours = "N/A";
    if (checkInTimestamp && checkOutTimestamp) {
      const totalWorkingMilliseconds = checkOutTimestamp.toMillis() - checkInTimestamp.toMillis();
      totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s
      `;
    }
    if (status == "home") {
      totalWorkingHours = "9h 0m 0s";
      const checkInDate = new Date();
      checkInDate.setHours(9, 0, 0, 0);
      finalCheckInTime = checkInDate;
      const checkOutDate = new Date();
      checkOutDate.setHours(18, 0, 0, 0);
      finalCheckOutTime = checkOutDate;
    }
    const updatedData = {
      status: status,
      checkInTime: finalCheckInTime,
      checkOutTime: finalCheckOutTime,
      totalWorkingHours: totalWorkingHours, 
    };
  
    try {
      await updateDoc(docRef, updatedData);
      closeEdit(); 
    } catch (error) {
      console.error("Error updating document:", error);
    }
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
              className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="home">Work From Home</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Check-In Time:</label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Check-Out Time:</label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-gray-600 font-medium mb-2 text-xl">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today} 
              className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg w-full"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={closeEdit}
              className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg w-full"
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
