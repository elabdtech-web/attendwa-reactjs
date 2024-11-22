import React, { useState, useEffect, useContext } from "react";
import { useUserContext } from "../../hooks/HeadertextContext";
import { getAuth } from "firebase/auth";
import { db } from "../../Firebase/FirebaseConfig";
import {collection,query,where,orderBy,limit,getDocs,Timestamp } from "firebase/firestore";
import { AuthContext } from "../../hooks/AuthContext";
import { format } from "date-fns";
const Calendar = ({selectedMonth,selectedYear,onMonthChange,onYearChange}) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
        className="border border-gray-300 rounded "
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

export default function Attendance() {
  const { headerText, setHeaderText } = useUserContext();
  const { allData } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const auth = getAuth();

  useEffect(() => {
    setHeaderText("Attendance");
    fetchUserDetails(selectedMonth, selectedYear);
  }, [allData.regId, setHeaderText, selectedMonth, selectedYear]);

  async function fetchUserDetails(month, year) {
    if (allData.regId) {
      const userRef = collection(db, "checkIns");
      const startOfMonth = format(
        new Date(selectedYear, selectedMonth, 1),
        "yyyy-MM-dd"
      );
      const endOfMonth = format(
        new Date(selectedYear, selectedMonth + 1, 0),
        "yyyy-MM-dd"
      );

      const userQuery = query(
        userRef,
        where("userId", "==", allData.regId),
        where("date", ">=", startOfMonth),
        where("date", "<=", endOfMonth),
        orderBy("date", "desc")
      );

      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const data = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceData(data);
      } 
      if (userSnapshot.empty) {
        setAttendanceData([]);
      }
  }
}
  const handleMonthChange = (month) => {
    setSelectedMonth(month === "" ? null : parseInt(month));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 base:p-6 p-2 bg-white">
          <div className="shadow my-auto py-3 base:px-8 px-2 base:flex justify-between">
            <h1 className="text-3xl font-semibold">Attendance</h1>
            <div className="flex max-base:justify-end max-base:mt-2">
            <Calendar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
            </div>
          </div>
          <table className="min-w-full shadow ">
            <thead>
              <tr className="bg-primary text-base">
                <th className="py-3">Date</th>
                <th className="py-3 max-xsm:hidden">Day</th>
                <th className="py-3">Time In</th>
                <th className="py-3">Time Out</th>
                <th className="py-3 max-sm:hidden">Working Hours</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-[#ECF4FF]">
              {attendanceData.length > 0 ? (
                attendanceData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-center max-lg:text-xs max-lg:font-semibold">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center max-xsm:hidden  max-lg:text-xs max-lg:font-semibold">
                      {entry.date
                        ? new Date(entry.date).toLocaleString("en-us", {
                            weekday: "long",
                          })
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center max-lg:text-xs max-lg:font-semibold">
                      {entry.checkInTime
                        ? new Date(
                            entry.checkInTime.toDate()
                          ).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center max-lg:text-xs max-lg:font-semibold">
                      {entry.checkOutTime
                        ? new Date(
                            entry.checkOutTime.toDate()
                          ).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center max-sm:hidden max-lg:text-xs max-lg:font-semibold">
                      {entry.totalWorkingHours || "N/A"}
                    </td>
                    <td className="py-3 text-center max-lg:text-xs max-lg:font-semibold">
                      {entry.status ? entry.status : "No"}
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