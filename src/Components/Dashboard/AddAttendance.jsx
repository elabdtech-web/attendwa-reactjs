import React, { useState } from 'react';
import { db } from '../../Firebase/FirebaseConfig';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import CustomInputField from '../CustomInputField';

export default function AddAttendance({ id }) {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const attendanceQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', id),
        where('date', '==', date)
      );
  
      const attendanceSnapshot = await getDocs(attendanceQuery);
      if (!attendanceSnapshot.empty) {
        toast.warning('Attendance for this date already exists.');
        setLoading(false);
        return;
      }
  
      let checkInTimestamp = null;
      let checkOutTimestamp = null;
      let totalWorkingHours = null;
  
      if (status === "home") {
        const checkInDate = new Date(`${date}T09:00:00`);
        const checkOutDate = new Date(`${date}T18:00:00`);
        
        checkInTimestamp = Timestamp.fromDate(checkInDate);
        checkOutTimestamp = Timestamp.fromDate(checkOutDate);
        totalWorkingHours = "9h 0m 0s";
      }
  
      if (checkInTime && checkOutTime) {
        const checkInDateTime = new Date(`${date}T${checkInTime}:00`);
        const checkOutDateTime = new Date(`${date}T${checkOutTime}:00`);
  
        if (checkOutDateTime <= checkInDateTime) {
          toast.warning("Check-out time must be greater than check-in time.");
          setLoading(false);
          return;
        }
  
        checkInTimestamp = Timestamp.fromDate(checkInDateTime);
        checkOutTimestamp = Timestamp.fromDate(checkOutDateTime);
  
        const totalWorkingMilliseconds = checkOutTimestamp.toMillis() - checkInTimestamp.toMillis();
  
        totalWorkingHours = `
          ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
          ${Math.floor((totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))}m 
          ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s
        `;
      }
  
      await addDoc(collection(db, 'checkIns'), {
        userId: id,
        checkInTime: checkInTimestamp,
        checkOutTime: checkOutTimestamp,
        totalWorkingHours,
        date,
        status,
        createdAt: Timestamp.now(),
      });
  
      toast.success('Attendance data saved successfully!');
      setCheckInTime('');
      setCheckOutTime('');
      setDate('');
      setStatus('present');
      window.location.reload();
      
    } catch (error) {
      toast.error('Error adding attendance data');
    }
    setLoading(false);
  };

  const onCheckOutHandler = (e) => {
    const newCheckOutTime = e.target.value;
    setCheckOutTime(newCheckOutTime);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
        Add Attendance
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 py-4">
        <div className="flex items-center justify-between ">
          <label className="block text-gray-600 font-medium mb-2 text-xl">Reg ID:</label>
          <div className="w-[300px]">
          <CustomInputField type="text" name="id" value={id} readOnly/>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="block text-gray-600 font-medium mb-2 text-xl">Check-In Time:</label>
          <div className="w-[300px]">
          <CustomInputField type="time" name="checkInTime" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)}  readOnly={status === "home"|| status === "holiday" || status === "leave" || status === "absent"}/> 
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
          <CustomInputField type={"date"} name="date" value={date} onChange={(e) => setDate(e.target.value)} required max={today}/>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="block text-gray-600 font-medium mb-2 text-xl">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[300px]"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
            <option value="home">Work From Home</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
        {loading ? (
          <div>
            <span className="bg-primary text-white font-semibold px-6 py-2 rounded">Loading...</span>
          </div>
        ) : (
          <button
            type="submit"
            className="bg-primary text-white font-semibold px-3 py-2 rounded"
          >
            Save Attendance
          </button>
        )}
      </form>
      </div>
  );
}
