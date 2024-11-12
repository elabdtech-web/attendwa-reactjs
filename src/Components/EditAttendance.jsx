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

        if (data.checkInTime instanceof Timestamp) {
          const checkInDate = data.checkInTime.toDate();
          const adjustedCheckInDate = new Date(checkInDate.getTime() + 5 * 60 * 60 * 1000); 
          setCheckInTime(adjustedCheckInDate.toISOString().slice(11, 16)); 
        } else {
          setCheckInTime(""); 
        }
    
        if (data.checkOutTime instanceof Timestamp) {
          const checkOutDate = data.checkOutTime.toDate(); 
          const adjustedCheckOutDate = new Date(checkOutDate.getTime() + 5 * 60 * 60 * 1000); 
          setCheckOutTime(adjustedCheckOutDate.toISOString().slice(11, 16));
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
  
    let finalCheckInTime = checkInTime ? new Date(`${date}T${checkInTime}:00`) : null;
    let finalCheckOutTime = checkOutTime ? new Date(`${date}T${checkOutTime}:00`) : null;

    if (finalCheckInTime && finalCheckOutTime && finalCheckOutTime <= finalCheckInTime) {
      alert("Check-out time must be greater than check-in time.");
      return;
    }
    
    let checkInTimestamp = finalCheckInTime && !isNaN(finalCheckInTime) ? Timestamp.fromDate(finalCheckInTime) : null;
    let checkOutTimestamp = finalCheckOutTime && !isNaN(finalCheckOutTime) ? Timestamp.fromDate(finalCheckOutTime) : null;
    
    let totalWorkingHours = "N/A";
    if (checkInTimestamp && checkOutTimestamp) {
      const totalWorkingMilliseconds = checkOutTimestamp.toMillis() - checkInTimestamp.toMillis();
      totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s
      `;
    }
    if (status === "home") {
      totalWorkingHours = "9h 0m 0s";
      finalCheckInTime = new Date(`${date}T09:00:00`);
      finalCheckOutTime = new Date(`${date}T18:00:00`);
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
