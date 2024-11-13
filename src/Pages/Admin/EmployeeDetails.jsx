import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Firebase/FirebaseConfig";
import { format } from "date-fns";
import {collection,query,where,orderBy,getDocs,Timestamp,updateDoc,doc,writeBatch,} from "firebase/firestore";
import EditAttendance from "../../Components/EditAttendance";
import AddAttendance from "../../Components/Dashboard/AddAttendance";

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

export default function EmployeeDetails() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeeData, setEmployeeData] = useState(null);
  const [addAttendance, setAddAttendance] = useState(false);
  const [editAttendance, setEditAttendance] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchAttendanceData(id);
      fetchEmployeeData(id);
    }
  }, [id, selectedMonth, selectedYear]);

  const fetchAttendanceData = async (id) => {
    try {
      updateMissingFields();
      const startOfMonth = format(
        new Date(selectedYear, selectedMonth, 1),
        "yyyy-MM-dd"
      );
      const endOfMonth = format(
        new Date(selectedYear, selectedMonth + 1, 0),
        "yyyy-MM-dd"
      );

      const userRef = collection(db, "checkIns");
      const userQuery = query(
        userRef,
        where("userId", "==", id),
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
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance data: ", error);
      setLoading(false);
    }
  };

  const fetchEmployeeData = async (regId) => {
    try {
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("regId", "==", regId));

      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setEmployeeData(userData);
      } else {
        setEmployeeData(null);
      }
    } catch (error) {
      console.error("Error fetching employee data: ", error);
    }
  };

  const handleAttendance = () => {
    setAddAttendance(true);
  };
  const handleEditAttendance = (entry) => {
    setEditAttendance(entry);
  };

  const updateMissingFields = async () => {
    const userCollectionRef = collection(db, "checkIns");

    try {
      const querySnapshot = await getDocs(userCollectionRef);

      const batch = writeBatch(db);

      querySnapshot.forEach((document) => {
        const docData = document.data();
        const docRef = doc(db, "checkIns", document.id);

        const fieldsToAdd = {
          status: docData.status || "N/A",
          totalWorkingHours:
            docData.totalWorkingHours ||
            calculateTotalWorkingHours(
              docData.checkInTime,
              docData.checkOutTime
            ),
          createdAt: docData.createdAt || docData.checkInTime,
          date:
            docData.date ||
            new Date(docData.checkInTime.seconds * 1000).toLocaleDateString(
              "en-CA"
            ),
        };
        function calculateTotalWorkingHours(checkInTime, checkOutTime) {
          if (!checkInTime || !checkOutTime) {
            return "N/A";
          }
          const checkInDate = checkInTime.toDate();
          const checkOutDate = checkOutTime.toDate();

          const totalMilliseconds = checkOutDate - checkInDate;
          const totalSeconds = Math.floor(totalMilliseconds / 1000);

          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          return `${hours}h ${minutes}m ${seconds}s`;
        }

        if (
          !("status" in docData) ||
          !("totalWorkingHours" in docData) ||
          !("createdAt" in docData) ||
          !("date" in docData)
        ) {
          batch.update(docRef, fieldsToAdd);
        }
      });

      await batch.commit();
      console.log("Successfully updated documents with missing fields.");
    } catch (error) {
      console.error("Error updating documents: ", error);
    }
  };

  return (
    <div className="relative">
      <div className=" p-6 m-6 rounded-lg max-w-4xl mx-auto">
        <div className="w-full flex justify-between border-b border-gray-300 items-center ">
          <h2 className="py-3 text-2xl font-semibold text-gray-800 ">
            Employee Details
          </h2>
          <button
            onClick={handleAttendance}
            className="bg-gray-800 text-white font-semibold px-3 py-2 rounded"
          >
            Add Attendance
          </button>
        </div>
        {employeeData ? (
          <div className="py-[2%] text-left flex justify-between">
            <div>
              <div className="flex items-center text-xl text-gray-700">
                <p className="font-medium text-gray-600">Name:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.fullName}
                </p>
              </div>
              <div className="flex items-center text-xl text-gray-700 pt-1">
                <p className="font-medium text-gray-600">Reg No:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.regId}
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xl text-gray-700">
                <p className="font-medium text-gray-600">Email:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.email}
                </p>
              </div>
              <div className="flex items-center text-xl text-gray-700 pt-1">
                <p className="font-medium text-gray-600">CNIC:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.cnic}
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
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((entry) => (
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
                    {entry.checkInTime && entry.checkInTime.toDate
                      ? new Date(
                          entry.checkInTime.toDate()
                        ).toLocaleTimeString()
                      : "N/A"}
                  </td>
                  <td className="py-3 text-center">
                    {entry.checkOutTime && entry.checkOutTime.toDate
                      ? new Date(
                          entry.checkOutTime.toDate()
                        ).toLocaleTimeString()
                      : "N/A"}
                  </td>
                  <td className="py-3 text-center">
                    {entry.totalWorkingHours || "N/A"}
                  </td>
                  <td className="py-3 text-center">{entry.status || "No"}</td>
                  <td className="py-3 text-center">
                    <button
                      className="border bg-gray-800 text-white text-[12px] px-2 py-1 rounded-lg"
                      onClick={() => handleEditAttendance(entry)}
                    >
                      Edit
                    </button>
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
      {addAttendance && (
        <div className="absolute w-full h-full top-0 bg-white">
          <AddAttendance id={id} />
        </div>
      )}
      {editAttendance && (
        <div className="absolute w-full h-full top-0 bg-white">
          <EditAttendance
            attendanceId={editAttendance.id}
            closeEdit={() => setEditAttendance(null)} 
          />
        </div>
      )}
    </div>
  );
}
