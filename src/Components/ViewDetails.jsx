import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import {collection,query,where,orderBy,getDocs,Timestamp,} from "firebase/firestore";

const Calendar = ({selectedMonth,selectedYear,onMonthChange,onYearChange,}) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December",];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 2020; i <= currentYear; i++) {
    years.push(i);
  }

  return (
    <div className="flex space-x-4">
      <select
        onChange={(e) => onMonthChange(e.target.value)}
        value={selectedMonth}
        className="border border-gray-300 rounded"
      >
        {months.map((month, index) => (
          <option key={index} value={index}>
            {month}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => onYearChange(e.target.value)}
        value={selectedYear}
        className="border border-gray-300 rounded"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function ViewDetails({ showDetails }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (showDetails && showDetails.regId) {
      fetchAttendanceData(showDetails.regId);
    }
  }, [showDetails, selectedMonth, selectedYear]);

  const fetchAttendanceData = async (regId) => {
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

      const userRef = collection(db, "checkIns");
      const userQuery = query(
        userRef,
        where("userId", "==", regId),
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
        where("createdAt", "<=", Timestamp.fromDate(endOfMonth)),
        orderBy("createdAt", "desc")
      );

      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const data = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceData(data);
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance data: ", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-6 m-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="py-3 text-2xl font-semibold text-gray-800 border-b border-gray-300">
          Employee Details
        </h2>
        {showDetails ? (
          <div className="py-[2%] text-left flex justify-between">
            <div className="">
              <div className="flex items-center text-xl text-gray-700">
                <p className="font-medium text-gray-600">Name:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {showDetails.fullName}
                </p>
              </div>
              <div className="flex items-center text-xl text-gray-700 pt-1">
                <p className="font-medium text-gray-600">Reg No:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {showDetails.regId}
                </p>
              </div>
            </div>
            <div className="">
              <div className="flex items-center text-xl text-gray-700">
                <p className="font-medium text-gray-600">Email:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {showDetails.email}
                </p>
              </div>
              <div className="flex items-center text-xl text-gray-700 pt-1">
                <p className="font-medium text-gray-600">CNIC:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {showDetails.cnic}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">Loading user data...</p>
        )}
        <div>
          <div className="flex justify-between mt-[3%]">
            <h2 className="py-3 text-2xl font-semibold text-gray-800 border-t border-gray-300 mt-6 w-full">
              Attendance Data
            </h2>
          </div>
          <div className="flex justify-end">
            <Calendar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(month) => setSelectedMonth(Number(month))}
              onYearChange={(year) => setSelectedYear(Number(year))}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-4 text-gray-500">
            Loading attendance data...
          </p>
        ) : attendanceData.length > 0 ? (
          <table className="min-w-full shadow mt-10">
            <thead>
              <tr className="shadow text-lg">
                <th className="py-3">Date</th>
                <th className="py-3">Day</th>
                <th className="py-3">Time In</th>
                <th className="py-3">Time Out</th>
                <th className="py-3">Working Hours</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
            {attendanceData.map((entry) => (
  <tr key={entry.id}>
    <td className="py-3 text-center">
      {entry.createdAt
        ? new Date(entry.createdAt.toDate()).toLocaleDateString()
        : "N/A"}
    </td>
    <td className="py-3 text-center">
      {entry.createdAt
        ? new Date(entry.createdAt.toDate()).toLocaleString("en-us", {
            weekday: "long",
          })
        : "N/A"}
    </td>
    <td className="py-3 text-center">
      {entry.checkInTime
        ? new Date(entry.checkInTime.toDate()).toLocaleTimeString()
        : "N/A"}
    </td>
    <td className="py-3 text-center">
      {entry.checkOutTime
        ? new Date(entry.checkOutTime.toDate()).toLocaleTimeString()
        : "N/A"}
    </td>
    <td className="py-3 text-center">
      {entry.totalWorkingHours || "N/A"}
    </td>
    <td className="py-3 text-center">
      {entry.status ? entry.status : "No"}
    </td>
  </tr>
))}

            </tbody>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">
            No attendance data found for this employee
          </p>
        )}
      </div>
    </div>
  );
}
