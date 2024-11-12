import React, { useState } from 'react';
import { db } from '../../Firebase/FirebaseConfig';
import { collection, addDoc, Timestamp,query,where,getDocs } from 'firebase/firestore';

export default function AddAttendance({ id }) {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Present');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const attendanceQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', id),
        where('date', '==', date)
      );
  
      const attendanceSnapshot = await getDocs(attendanceQuery);
      if (!attendanceSnapshot.empty) {
        alert('Attendance for this date already exists.');
        setLoading(false);
        return;
      }
      let checkInTimestamp = null;
      let checkOutTimestamp = null;
      let totalWorkingHours = "N/A";
      if (status == "home") {
        totalWorkingHours = "9h 0m 0s";
        const checkInDate = new Date();
        checkInDate.setHours(9, 0, 0, 0);
        checkInTimestamp = checkInDate;
        const checkOutDate = new Date();
        checkOutDate.setHours(18, 0, 0, 0);
        checkOutTimestamp = checkOutDate;
      }

      if (checkInTime && checkOutTime) {
        const checkInDateTime = new Date(`${date}T${checkInTime}:00`);
        const checkOutDateTime = new Date(`${date}T${checkOutTime}:00`);

      if (checkOutDateTime <= checkInDateTime) {
        alert("Check-out time must be greater than check-in time.");
        return;
      }

      const checkInTimestamp = Timestamp.fromDate(checkInDateTime);
      const checkOutTimestamp = Timestamp.fromDate(checkOutDateTime);

      const totalWorkingMilliseconds = checkOutTimestamp.toMillis() - checkInTimestamp.toMillis();

      const totalWorkingHours = `
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

      setSuccess('Attendance data saved successfully!');
      setCheckInTime('');
      setCheckOutTime('');
      setDate('');
      setStatus('present');
    } catch (error) {
      setError('Attendance Data of this date is available');
      console.error('Error adding attendance data:', error);
    }
    setLoading(false);
  };

  const onCheckOutHandler = (e) => {
    const newCheckOutTime = e.target.value;
    if (newCheckOutTime <= checkInTime) {
      alert("Check-out time must be greater than check-in time.");
      return;
    }
    setCheckOutTime(newCheckOutTime);
  };
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
        Add Attendance
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 py-4">
        <div className="flex items-center justify-between">
          <label className="block text-gray-600 font-medium mb-2 text-xl">Reg ID:</label>
          <input
            type="text"
            value={id}
            readOnly
            className="px-4 py-2 ml-5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none w-[30%]"
          />
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
            onChange={onCheckOutHandler}
            className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="block text-gray-600 font-medium mb-2 text-xl">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
             max={today} 
            className="px-4 py-2 ml-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-[30%]"
          />
        </div>
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
        {loading ? (
          <div>
            <span className="bg-gray-800 text-white font-semibold px-6 py-2 rounded">Loading...</span>
          </div>
        ) : (
          <button
            type="submit"
            className="bg-gray-800 text-white font-semibold px-3 py-2 rounded"
          >
            Save Attendance
          </button>
        )}
      </form>
      {error && <p className="text-center text-red-500 text-sm mt-4">{error}</p>}
      {success && <p className="text-center text-green-500 text-sm mt-4">{success}</p>}
    </div>
  );
}
