import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Firebase/FirebaseConfig";
import { format } from "date-fns";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
} from "firebase/firestore";
import EditAttendance from "../../Components/EditAttendance";
import AddAttendance from "../../Components/Dashboard/AddAttendance";
import { CircularProgressbar } from "react-circular-progressbar";
import { toast } from "react-toastify";
const Calendar = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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

export default function EmployeeDetails() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
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
        const checkIns = userSnapshot.docs.map((doc) => doc.data());
        let totalHours = 0;
        let totalMinutes = 0;
        let workFromHome = 0;
        let presentDays = 0;
        let absentDays = 0;
        let leaveDays = 0;
        let holidays = 0;
        let workingDaysInMonth =30;

        const allStatusDates = new Set();

        checkIns.forEach((checkIn) => {
          const { status, totalWorkingHours: twh, date } = checkIn;

          if (
            date &&
            (status === "present" ||
              status === "home" ||
              status === "absent" ||
              status === "leave")
          ) {
            allStatusDates.add(date);

            if (status === "present" || status === "home") {
              if (twh) {
                const hours = parseInt(twh.split("h")[0].trim()) || 0;
                const minutes =
                  parseInt(twh.split("m")[0].split("h")[1].trim()) || 0;

                totalHours += hours;
                totalMinutes += minutes;

                if (totalMinutes >= 60) {
                  totalHours += Math.floor(totalMinutes / 60);
                  totalMinutes = totalMinutes % 60;
                }
              }
            }
            if (status === "present") presentDays++;
            if (status === "home") workFromHome++;
            if (status === "absent") absentDays++;
            if (status === "leave") leaveDays++;
          }
          if (status === "holiday") holidays++;
        });

        const formattedTotalWorkingHours = `${String(totalHours).padStart(
          2,
          "0"
        )}h : ${String(totalMinutes).padStart(2, "0")}m`;

        // const workingDaysInMonth = allStatusDates.size;
        const percentageOfWorkingDays = Math.floor(
          ((workingDaysInMonth-absentDays) / workingDaysInMonth ) * 100
        );
        const percentageOfLeaveDays = Math.floor((leaveDays / 2) * 100);
        setAttendanceSummary({
          presentDays,
          absentDays,
          leaveDays,
          workFromHome,
          holidays,
          workingDaysInMonth,
          totalDutyHours: (allStatusDates.size - leaveDays) * 9,
          totalWorkingHours: formattedTotalWorkingHours,
          percentageOfWorkingDays,
          percentageOfLeaveDays,
        });
      } else {
        setAttendanceData([]);
        setAttendanceSummary(null);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching attendance data ");
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
      }
      if (userSnapshot.empty) {
        setEmployeeData(null);
      }
    } catch (error) {
      toast.error("Error fetching employee data ");
    }
  };

  const handleAttendance = () => {
    setAddAttendance(true);
  };
  const handleEditAttendance = (entry) => {
    setEditAttendance(entry);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month === "" ? null : parseInt(month));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
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
            className="bg-primary text-white font-semibold px-3 py-2 rounded"
          >
            Add Attendance
          </button>
        </div>
        {employeeData ? (
          <div className="pt-[2%] text-left">
            <div className="flex justify-between">
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
            <div className="flex justify-between">
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
            <div className="flex justify-between">
              <div className="flex items-center text-xl text-gray-700">
                <p className="font-medium text-gray-600">Phone:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.phone || " ------"}
                </p>
              </div>
              <div className="flex items-center text-xl text-gray-700 pt-1">
                <p className="font-medium text-gray-600">Address:</p>
                <p className="font-normal text-gray-800 pl-1">
                  {employeeData.address || "------"}
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
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
          </div>
        </div>
        <div className="flex max-sm:flex-col max-xl:items-center justify-between mt-10 gap-5">
          <div className="sm:w-[25%] flex justify-center mx-auto">
            {attendanceSummary ? (
              <CircularProgressbar
                value={attendanceSummary.percentageOfWorkingDays}
                text={`${attendanceSummary.percentageOfWorkingDays}%`}
                styles={{
                  text: { fill: "#41E975" },
                  path: { stroke: "#41E975" },
                }}
              />
            ) : (
              <CircularProgressbar value={0} text={`0%`}
              styles={{
                text: { fill: "#41E975" },
                path: { stroke: "#41E975" },
              }} />
            )}
          </div>
          <div className="sm:w-[60%] w-full mt-3 flex flex-col justify-center">
            { loading ? (
              <p className="mt-6 text-gray-500">
                Loading attendance summary...
            </p>
            )
            : attendanceSummary ? (
              <div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Present:</p>
                  <p>{attendanceSummary.presentDays} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Work From Home:</p>
                  <p>{attendanceSummary.workFromHome} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Leave:</p>
                  <p>{attendanceSummary.leaveDays} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Absent:</p>
                  <p>{attendanceSummary.absentDays} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Holidays:</p>
                  <p>{attendanceSummary.holidays} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Working Days:</p>
                  <p>{attendanceSummary.workingDaysInMonth} days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Duty Hours:</p>
                  <p>{attendanceSummary.totalDutyHours} hours</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 font-medium">Working Hours:</p>
                  <p>{attendanceSummary.totalWorkingHours} hours</p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-gray-500">
                No attendance data available.
              </p>
            )}
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
                      className="border bg-primary text-white text-[12px] px-2 py-1 rounded-lg"
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
