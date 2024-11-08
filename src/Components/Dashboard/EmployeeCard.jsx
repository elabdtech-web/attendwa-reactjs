import React, { useState, useEffect } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import {collection,query,where,getDocs,orderBy,limit,doc,updateDoc,setDoc,} from "firebase/firestore";
import { startOfDay, endOfDay } from "date-fns";

export default function EmployeeCard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchEmployeesAttendanceData = async () => {
    try {
      const employeeCollection = collection(db, "users");
      const employeeQuery = query(
        employeeCollection,
        where("role", "==", "employee")
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      const startOfToday = startOfDay(new Date());
      const endOfToday = endOfDay(new Date());

      const employeeList = await Promise.all(
        employeeSnapshot.docs.map(async (doc) => {
          const employeeData = doc.data();
          const userId = employeeData.regId;

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

          if (checkInSnapshot.size > 0) {
            const checkInData = checkInSnapshot.docs[0].data();
            return {
              id: doc.id,
              regId: userId,
              fullName: employeeData.fullName,
              checkInTime: checkInData.checkInTime
                ? checkInData.checkInTime.toDate().toLocaleTimeString()
                : "N/A",
              checkOutTime: checkInData.checkOutTime
                ? checkInData.checkOutTime.toDate().toLocaleTimeString()
                : "N/A",
              hasCheckedIn: true,
              status: checkInData.status || "present",
            };
          } else {
            const ifNotCheckInCollection = collection(db, "checkIns");
            const ifNotCheckInQuery = query(
              ifNotCheckInCollection,
              where("userId", "==", userId),
              where("createdAt", ">=", startOfToday),
              where("createdAt", "<=", endOfToday),
              orderBy("createdAt", "desc"),
              limit(1)
            );
            const ifNotCheckInSnapshot = await getDocs(ifNotCheckInQuery);

            let status = "N/A";
            if (!ifNotCheckInSnapshot.empty) {
              const ifNotCheckInData = ifNotCheckInSnapshot.docs[0].data();
              status = ifNotCheckInData.status || "N/A";
            }

            return {
              id: doc.id,
              regId: userId,
              fullName: employeeData.fullName,
              checkInTime: "N/A",
              checkOutTime: "N/A",
              hasCheckedIn: false,
              status: status,
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

  const handleStatusUpdate = async (userId, status) => {
    try {
      const checkInCollection = collection(db, "checkIns");
      const checkInQuery = query(
        checkInCollection,
        where("userId", "==", userId),
        where("checkInTime", ">=", startOfDay(new Date())),
        where("checkInTime", "<=", endOfDay(new Date()))
      );

      const checkInSnapshot = await getDocs(checkInQuery);
      const createdAt = new Date();

      if (checkInSnapshot.empty) {
        let checkInTime = null;
        let checkOutTime = null;
        let totalWorkingHours = null;
        if (status == "home") {
          totalWorkingHours = "9h 0m 0s";
          const checkInDate = new Date();
          checkInDate.setHours(9, 0, 0, 0);
          checkInTime = checkInDate;
          const checkOutDate = new Date();
          checkOutDate.setHours(18, 0, 0, 0);
          checkOutTime = checkOutDate;
        }

        await setDoc(doc(checkInCollection), {
          userId: userId,
          status: status,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          totalWorkingHours: totalWorkingHours,
          createdAt,
        });
        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.regId === userId
              ? {
                  ...employee,
                  status: status,
                  checkInTime: checkInTime ? checkInTime.toLocaleTimeString() : "N/A",
                  checkOutTime: checkOutTime ? checkOutTime.toLocaleTimeString() : "N/A",
                  hasCheckedIn: true,
                }
              : employee
          )
        );
      } else {
        const docRef = checkInSnapshot.docs[0].ref;
        await updateDoc(docRef, { status: status, createdAt });
        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.regId === userId
              ? { ...employee, status: status }
              : employee
          )
        );
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.regId === userId ? { ...employee, status: status } : employee
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openDialog = (employee, status) => {
    setSelectedEmployee(employee);
    setSelectedStatus(status);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedEmployee(null);
    setSelectedStatus("");
  };

  const confirmStatusUpdate = () => {
    if (selectedEmployee && selectedStatus) {
      handleStatusUpdate(selectedEmployee.regId, selectedStatus);
      closeDialog();
    }
  };

  useEffect(() => {
    fetchEmployeesAttendanceData();
  }, []);

  return (
    <div className="mx-auto mt-8">
      <div className="py-2 px-4 shadow w-full text-2xl font-semibold">
        Today's Attendance
      </div>

      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
            <p className="mb-4">
              Are you sure you want to set the status to "{selectedStatus}"?
            </p>
            <div className="flex justify-end">
              <button
                onClick={confirmStatusUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={closeDialog}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full shadow">
        <thead className="shadow">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Check In</th>
            <th className="py-2 px-4 text-left">Check Out</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center p-5 text-[20px]">
                Loading Data...
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="py-2 px-4 w-[20%]">{employee.fullName}</td>
                <td className="py-2 px-4 w-[20%]">{employee.checkInTime}</td>
                <td className="py-2 px-4 w-[20%]">{employee.checkOutTime}</td>
                <td className="py-2 px-1 w-[30%] flex-1 justify-between">
                  {employee.status !== "N/A" ? (
                    <span className="text-gray-800 ml-2">
                      {employee.status}
                    </span>
                  ) : (
                    <div>
                      <button
                        className="bg-black text-white ml-2 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "absent")}
                      >
                        Absent
                      </button>
                      <button
                        className="bg-black text-white ml-4 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "leave")}
                      >
                        Leave
                      </button>
                      <button
                        className="bg-black text-white ml-4 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "home")}
                      >
                        Work From Home
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
