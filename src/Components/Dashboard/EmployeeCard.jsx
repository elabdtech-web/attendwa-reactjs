import React, { useState, useEffect } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { startOfDay, endOfDay } from "date-fns";

export default function EmployeeCard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployeesAttendanceData = async () => {
    console.log("Fetching employee data...");
    try {
      const employeeCollection = collection(db, "users");
      const employeeQuery = query(employeeCollection, where("role", "==", "employee"));
      const employeeSnapshot = await getDocs(employeeQuery);
      
      const startOfToday = startOfDay(new Date());
      const endOfToday = endOfDay(new Date());

      const employeeList = await Promise.all(
        employeeSnapshot.docs.map(async (doc) => {
          const employeeData = doc.data();
          const userId = employeeData.regId; 

          console.log("Fetching today's check-in data for user ID:", userId);
          
          const checkInCollection = collection(db, "checkIns");
          const checkInQuery = query(
            checkInCollection,
            where("userId", "==", userId),
            where("checkInTime", ">=", startOfToday),
            where("checkInTime", "<=", endOfToday),
            orderBy("checkInTime", "desc"),
            limit(1)
          );
          const checkInSnapshot = await getDocs(checkInQuery);

          console.log(`Check-in snapshot size for user ID ${userId}:`, checkInSnapshot.size);

          if (checkInSnapshot.size > 0) {
            const checkInData = checkInSnapshot.docs[0].data();
            console.log("Today's check-in data found:", checkInData);

            return {
              id: doc.id,
              fullName: employeeData.fullName,
              checkInTime: checkInData.checkInTime ? checkInData.checkInTime.toDate().toLocaleTimeString() : "N/A",
              checkOutTime: checkInData.checkOutTime ? checkInData.checkOutTime.toDate().toLocaleTimeString() : "N/A",
            };
          } else {
            console.log("No check-in data found for user ID:", userId);
            return {
              id: doc.id,
              fullName: employeeData.fullName,
              checkInTime: "N/A",
              checkOutTime: "N/A",
            };
          }
        })
      );

      setEmployees(employeeList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAttendanceData();
  }, []);

  return (
    <div className="mx-auto mt-8">
      <div className="py-2 px-4 shadow w-full text-2xl font-semibold">
        List Of Employees
      </div>
      <table className="w-full shadow">
        <thead className="shadow">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Check In</th>
            <th className="py-2 px-4 text-left">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" className="text-center p-5 text-[20px]">Loading Data...</td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="py-2 px-4">{employee.fullName}</td>
                <td className="py-2 px-4">{employee.checkInTime}</td>
                <td className="py-2 px-4">{employee.checkOutTime}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
