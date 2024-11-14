import React, { useState, useEffect, useContext } from "react";
import HeaderDashboard from "../../Components/Dashboard/HeaderDashboard";
import Sidebar from "../../Components/Dashboard/EmployeeSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { useUserContext } from "../../hooks/HeadertextContext";
import { AuthContext } from "../../hooks/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Employees() {
  const { userType } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setHeaderText } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployeePage = location.pathname == "/a-dashboard/employees";

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
      toast.error("Error fetching employees: ", error);
      setLoading(false);
    }
  };

  const terminateEmployee = async (employeeId) => {
    try {
      const employeeDocRef = doc(db, "users", employeeId);
      await updateDoc(employeeDocRef, { status: "inactive" });

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, status: "inactive" }
            : employee
        )
      );
      toast.success("Employee terminated successfully"); 
    } catch (error) {
      toast.error("Error updating employee status: ", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    setHeaderText("Employees");
  }, []);
  return (
    <div className="flex relative">
      <div className="flex-1 flex flex-col ">
        <div className="mt-[3%] mx-[10%] ">
          {isEmployeePage ? (
            <div>
              <div className="flex justify-end mb-3">
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
                      Email
                    </th>
                    <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                      CNIC
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
                      .filter((employee) => employee.role === "employee")
                      .sort((a, b) => {
                        const regIdA = a.regId
                          ? parseInt(a.regId.split("-")[1], 10)
                          : -1;
                        const regIdB = b.regId
                          ? parseInt(b.regId.split("-")[1], 10)
                          : -1;
                        return regIdB - regIdA;
                      })
                      .map((employee) => (
                        <tr key={employee.id}>
                          <td className="border text-center py-2">
                            {employee.regId}
                          </td>
                          <td className="border text-center py-2">
                            {employee.fullName}
                          </td>
                          <td className="border text-center py-2">
                            {employee.email}
                          </td>
                          <td className="border text-center py-2">
                            {employee.cnic}
                          </td>
                          <td className="border">
                            <div className="flex justify-center px-5">
                              <button
                                className="border bg-gray-800 text-white text-[12px] px-2 py-1 rounded-lg"
                                onClick={() => setShowDetails(employee)}
                              >
                                <Link to={`./${employee.regId}`}>View</Link>
                              </button>

                              <button
                                className={`border text-[12px] px-2 py-1 rounded-lg ${
                                  employee.status === "inactive"
                                    ? "bg-red-500 text-white cursor-not-allowed"
                                    : "bg-gray-800 text-white"
                                }`}
                                onClick={() =>
                                  employee.status !== "inactive" &&
                                  terminateEmployee(employee.id)
                                }
                                disabled={employee.status === "inactive"}
                              >
                                {employee.status === "inactive"
                                  ? "Terminated"
                                  : "Terminate"}
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
