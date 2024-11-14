import React, { useState, useEffect, useContext } from "react";
import { useUserContext } from "../../hooks/HeadertextContext";
import { getAuth } from "firebase/auth";
import { db } from "../../Firebase/FirebaseConfig";
import {collection,query,where,orderBy,limit,getDocs,Timestamp } from "firebase/firestore";
import { AuthContext } from "../../hooks/AuthContext";
import { format } from "date-fns";
import Calendar from "../../Components/Calendar";

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
        <div className="flex-1 p-6 bg-white">
          <div className="shadow my-auto py-3 px-12 flex justify-between">
            <h1 className="text-3xl font-semibold">Attendance</h1>
            <Calendar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
          </div>
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
              {attendanceData.length > 0 ? (
                attendanceData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-center">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center">
                      {entry.date
                        ? new Date(entry.date).toLocaleString("en-us", {
                            weekday: "long",
                          })
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center">
                      {entry.checkInTime
                        ? new Date(
                            entry.checkInTime.toDate()
                          ).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center">
                      {entry.checkOutTime
                        ? new Date(
                            entry.checkOutTime.toDate()
                          ).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-center">
                      {entry.totalWorkingHours || "N/A"}
                    </td>
                    <td className="py-3 text-center">
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