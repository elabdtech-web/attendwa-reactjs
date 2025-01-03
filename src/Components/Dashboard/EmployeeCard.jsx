import React, { useState, useEffect } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import CustomInputField from "../CustomInputField";
import { useNavigate } from "react-router-dom";
import { MdDateRange } from "react-icons/md";

export default function EmployeeCard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDialogConfirmation, setShowDialogConfirmation] = useState(false);
  const [holidayDate, setHolidayDate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();

  const fetchEmployeesAttendanceData = async () => {
    try {
      const employeeCollection = collection(db, "users");
      const employeeQuery = query(
        employeeCollection,
        where("role", "==", "employee"),
        where("status", "==", "active")
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      const employeeList = await Promise.all(
        employeeSnapshot.docs.map(async (doc) => {
          const employeeData = doc.data();
          const userId = employeeData.regId;

          const checkInCollection = collection(db, "checkIns");
          const checkInQuery = query(
            checkInCollection,
            where("userId", "==", userId),
            where("date", "==", date)
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
                : null,
              checkOutTime: checkInData.checkOutTime
                ? checkInData.checkOutTime.toDate().toLocaleTimeString()
                : null,
              hasCheckedIn: true,
              status: checkInData.status || "present",
            };
          }
          if (checkInSnapshot.size === 0) {
            return {
              id: doc.id,
              regId: userId,
              fullName: employeeData.fullName,
              checkInTime: null,
              checkOutTime: null,
              hasCheckedIn: false,
              status: "N/A",
            };
          }
        })
      );

      setEmployees(employeeList);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching employees");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, status) => {
    setLoading(true);
    try {
      const checkInCollection = collection(db, "checkIns");

      const checkInQuery = query(
        checkInCollection,
        where("userId", "==", userId),
        where("date", "==", date)
      );

      const checkInSnapshot = await getDocs(checkInQuery);
      const createdAt = new Date();

      if (checkInSnapshot.empty) {
        let checkInTime = null;
        let checkOutTime = null;
        let totalWorkingHours = null;
        if (status === "home") {
          totalWorkingHours = "8h 0m 0s";
          const checkInDate = new Date();
          checkInDate.setHours(10, 0, 0, 0);
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
          date: date,
        });

        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.regId === userId
              ? {
                  ...employee,
                  status: status,
                  checkInTime: checkInTime
                    ? checkInTime.toLocaleTimeString()
                    : null,
                  checkOutTime: checkOutTime
                    ? checkOutTime.toLocaleTimeString()
                    : null,
                  hasCheckedIn: true,
                }
              : employee
          )
        );
      }
      if (checkInSnapshot.size > 0) {
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
    } catch (error) {
      toast.error("Error updating status");
    }
    setLoading(false);
  };

  const markHolidayForActiveEmployees = async () => {
    try {
      const usersRef = collection(db, "users");
      const activeEmployeesQuery = query(
        usersRef,
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(activeEmployeesQuery);

      const timestamp = Timestamp.now();
      const selectedDate =
        holidayDate || new Date().toISOString().split("T")[0];

      for (const doc of querySnapshot.docs) {
        const { regId } = doc.data();

        const checkInCollection = collection(db, "checkIns");
        const checkInQuery = query(
          checkInCollection,
          where("userId", "==", regId),
          where("date", "==", selectedDate)
        );
        const checkInSnapshot = await getDocs(checkInQuery);

        if (!checkInSnapshot.empty) {
          const checkInDocRef = checkInSnapshot.docs[0].ref;
          await updateDoc(checkInDocRef, {
            checkInTime: null,
            checkOutTime: null,
            createdAt: timestamp,
            status: "holiday",
            totalWorkingHours: null,
          });
        }
        if (checkInSnapshot.empty) {
          await addDoc(checkInCollection, {
            userId: regId,
            checkInTime: null,
            checkOutTime: null,
            createdAt: timestamp,
            date: selectedDate,
            status: "holiday",
            totalWorkingHours: null,
          });
        }
      }
      toast.success("Holiday marked for all active employees.");
      fetchEmployeesAttendanceData();
    } catch (error) {
      toast.success("Failed to mark holiday for employees.");
    }
  };

  const handleEmployeeClick = (employee) => {
    navigate(`/a-dashboard/employees/${employee.regId}`);
  };

  const openCheckInDialog = () => setShowDialogConfirmation(true);
  const closeCheckInDialog = () => setShowDialogConfirmation(false);

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
  }, [date]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className=" mt-8 shadow">
      <div className="py-2 px-4 shadow w-full text-2xl flex justify-between items-center">
        <div className="font-semibold">Today's Attendance</div>
        <div className="flex items-center">
          <p className="mr-3 text-primary text-lg">{date}</p>
          <div className="relative inline-block">
            <MdDateRange className="text-primary text-3xl" />
            <input
              type="date"
              id="datePicker"
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="absolute inset-0 opacity-0"
            />
          </div>
          <button
            className="bg-primary text-white px-3 py-1 text-base rounded-md ml-5"
            onClick={openCheckInDialog}
          >
            Holiday
          </button>
        </div>
      </div>

      <table className="w-full shadow">
        <thead className="shadow bg-primary">
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
              <tr key={employee.id} className="border-b bg-[#ECF4FF]">
                <td
                  className="py-2 px-4 w-[19%] cursor-pointer hover:text-secondary"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  {employee.fullName}
                </td>
                <td className="py-2 px-4 w-[18%]">
                  {employee.checkInTime ? employee.checkInTime : "--"}
                </td>
                <td className="py-2 px-4 w-[18%]">
                  {employee.checkOutTime ? employee.checkOutTime : "--"}
                </td>
                <td className="py-2 px-1 w-[45%] flex-1 justify-between">
                  {employee.status !== "N/A" ? (
                    <span className="text-gray-800 ml-2">
                      {employee.status}
                    </span>
                  ) : (
                    <div>
                      <button
                        className="bg-primary text-white ml-2 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "absent")}
                      >
                        Absent
                      </button>
                      <button
                        className="bg-primary text-white ml-4 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "leave")}
                      >
                        Leave
                      </button>
                      <button
                        className="bg-primary text-white ml-4 px-5 py-1 rounded"
                        onClick={() => openDialog(employee, "home")}
                      >
                        Home
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
            <p className="mb-4">
              Are you sure you want to set the status to "{selectedStatus}"?
            </p>
            <div className="flex justify-end">
              <button
                onClick={confirmStatusUpdate}
                className="bg-primary text-white px-4 py-2 rounded mr-2"
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

      {showDialogConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Which Date you want to give Holiday
            </h2>
            <CustomInputField
              type="date"
              name="holidayDate"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  markHolidayForActiveEmployees();
                  setShowDialogConfirmation(false);
                }}
                className="bg-primary text-white px-4 py-2 rounded mr-2"
              >
                Mark Holiday
              </button>
              <button
                onClick={() => setShowDialogConfirmation(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
