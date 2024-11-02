import React, { useState, useEffect, useContext } from "react";
import HeaderDashboard from "../../Components/Dashboard/HeaderDashboard";
import Sidebar from "../../Components/Dashboard/EmployeeSidebar";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { useUserContext } from "../../hooks/HeadertextContext";
import { AuthContext } from "../../hooks/AuthContext";
export default function Employees() {
  const {userType} = useContext(AuthContext)

  const [employees, setEmployees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setHeaderText } = useUserContext();
  const navigate = useNavigate();
  const handleClick = () => {
    setShowForm(true);
    navigate("/a-dashboard/employees/FormPage");
  };
  const fetchEmployees = async () => {
    try {
      const employeeCollection = collection(db, "users");
      const employeeSnapshot = await getDocs(employeeCollection);
      const employeeList = employeeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    setHeaderText("Employees");
    function useContext() {}
    useContext();
  }, []);
  return (
    <div className="flex">
      <div className="flex-1 flex flex-col ">
        <div className="mt-[3%] mx-[10%] ">
          {!showForm ? (
            <div>
              <div className="flex justify-end mb-1">
                <button
                  className=" bg-gray-800 text-white font-semibold px-3 py-2 rounded-lg"
                  onClick={handleClick}
                >
                  Add Employee
                </button>
              </div>

              <table className="w-full">
                <thead className="">
                  <tr>
                    <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                      REG-ID
                    </th>
                    <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                      Full Name
                    </th>
                    <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                      CNIC
                    </th>
                    <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                      Status
                    </th>
                    <th className="border w-[20%]">
                      <div className="px-5 text-center">
                        <div className="font-semibold text-[20px] py-2 ">
                          Action
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center p-5 text-[20px]">
                        Loading Details
                      </td>
                    </tr>
                  ) : (
                    employees.length > 0 &&
                    employees
                      .filter(employee => employee.role === "employee")
                      .sort((a, b) => {
                        const regIdA = a.regId ? parseInt(a.regId.split("-")[1], 10) : -1;
                        const regIdB = b.regId ? parseInt(b.regId.split("-")[1], 10) : -1;
                        return regIdB - regIdA;
                      })
                      .map(employee => (
                        <tr key={employee.id}>
                          <td className="border text-center py-2">{employee.regId}</td>
                          <td className="border text-center py-2">{employee.fullName}</td>
                          <td className="border text-center py-2">{employee.cnic}</td>
                          <td className="border text-center py-2">{employee.status}</td>
                          <td className="border">
                            <div className="flex justify-center px-5">
                              <button className="border bg-gray-800 text-white text-[12px] px-2 py-1 rounded-lg">
                                View
                              </button>
                              <button className="border bg-gray-800 text-white text-[12px] px-2 py-1 rounded-lg">
                                Terminate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
