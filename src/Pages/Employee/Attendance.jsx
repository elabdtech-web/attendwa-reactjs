import React, { useState, useEffect, useContext } from "react";
import { useUserContext } from "../../hooks/HeadertextContext";
import { getAuth } from "firebase/auth";
import { db } from "../../Firebase/FirebaseConfig";
import {collection,query,where,orderBy,limit,getDocs,Timestamp } from "firebase/firestore";
import { AuthContext } from "../../hooks/AuthContext";

const MonthSelector = ({ onChange }) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <select
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2"
    >
      <option value="">Select a month</option>
      {months.map((month, index) => (
        <option key={index} value={index}>{month}</option>
      ))}
    </select>
  );
};

export default function Attendance() {
  const { headerText, setHeaderText } = useUserContext();
  const { allData } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); 
  const auth = getAuth();

  useEffect(() => {
    setHeaderText("Attendance");
    fetchUserDetails(selectedMonth); 
  }, [allData.regId, setHeaderText, selectedMonth]);

  async function fetchUserDetails(month = null) {
    if (allData.regId) {
      const userRef = collection(db, "checkIns");
      let userQuery;

      if (month !== null) {
        const now = new Date();
        const year = now.getFullYear();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        userQuery = query(
          userRef,
          where("userId", "==", allData.regId),
          where("checkInTime", ">=", Timestamp.fromDate(startOfMonth)),
          where("checkInTime", "<=", Timestamp.fromDate(endOfMonth)),
          orderBy("checkInTime", "desc")
        );
      } else {
        userQuery = query(
          userRef,
          where("userId", "==", allData.regId),
          orderBy("checkInTime", "desc"),
          limit(7)
        );
      }

      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const data = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceData(data);
      } else {
        console.error("No attendance data found");
        setAttendanceData([]);
      }
    }
  }

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month === "" ? null : parseInt(month)); 
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white">
          <div className="shadow my-auto py-3 px-12 flex justify-between">
            <h1 className="text-3xl font-semibold">Attendance</h1>
            <MonthSelector onChange={handleMonthChange} />
          </div>
          <table className="min-w-full shadow mt-10">
            <thead>
              <tr className="shadow text-lg">
                <th className="py-3">Date</th>
                <th className="py-3">Day</th>
                <th className="py-3">Time In</th>
                <th className="py-3">Time Out</th>
                <th className="py-3">Working Hours</th>
                <th className="py-3">On Leave</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-center">
                      {new Date(entry.checkInTime.toDate()).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-center">
                      {new Date(entry.checkInTime.toDate()).toLocaleString("en-us", { weekday: "long" })}
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
                      {entry.onLeave ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center">
                    No attendance data for the selected month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
