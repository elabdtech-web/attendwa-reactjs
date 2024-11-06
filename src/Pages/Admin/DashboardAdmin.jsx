import React, {useState, useEffect, useContext } from "react";
import Details from "../../Components/Dashboard/Details";
import EmployeeCard from "../../Components/Dashboard/EmployeeCard";
import LeaveCard from "../../Components/Dashboard/LeaveCard";
import { AuthContext } from "../../hooks/AuthContext";
import { useUserContext } from "../../hooks/HeadertextContext";
import { db } from "../../Firebase/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardAdmin() {
  const { userType, allData } = useContext(AuthContext);
  const { setHeaderText } = useUserContext();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    setHeaderText("Dashboard");

    const fetchTotalEmployees = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "employee"));
        const querySnapshot = await getDocs(q);
        setTotalEmployees(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchTotalEmployees();
  },[setHeaderText]);

  const details = [
    {
      id: 1,
      title: "Total Employees",
      description: totalEmployees.toString(),
    },
    {
      id: 2,
      title: "Active Projects",
      description: "200",
    },
    {
      id: 3,
      title: "Total Clients",
      description: "200",
    },
    {
      id: 4,
      title: "Total Projects",
      description: "200",
    },
  ];

  return (
    <div className="flex ">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white">
          <div className="flex shadow p-5 m-4 gap-3">
          {/* <div className="rounded-full pt-1">
            <img src={allData.image} alt="User" className="w-14 h-10"/>
          </div> */}
          <div className="flex w-full justify-between">
            <div>
              <h1 className="font-semibold text-xl text-blue-800">
                Welcome Admin,
              </h1>
              <h1>You're logged in as an Admin!</h1>
            </div>
            <div className="font-sans font-medium text-gray-500 text-right flex flex-col items-center">
              <p>
                {currentDateTime.toLocaleDateString("en-GB", {
                  weekday: "long",
                })}
                ,{" "}
                {currentDateTime.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>
                {currentDateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

          <div className="flex justify-between gap-7 m-4 mt-8 ">
            {details.map((item) => (
              <div key={item.id} className="w-[23%]">
                <Details title={item.title} description={item.description} />
              </div>
            ))}
          </div>

          <div className="flex gap-7 m-4">
            <div className="w-[50%]">
              <EmployeeCard />
            </div>
            <div className="w-[50%]">
              <LeaveCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
