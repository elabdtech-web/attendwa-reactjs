import React, { useState, useEffect, useContext } from "react";
import Details from "../../Components/Dashboard/Details";
import EmployeeCard from "../../Components/Dashboard/EmployeeCard";
import LeaveCard from "../../Components/Dashboard/LeaveCard";
import { AuthContext } from "../../hooks/AuthContext";
import { useUserContext } from "../../hooks/HeadertextContext";
import { db } from "../../Firebase/FirebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function DashboardAdmin() {
  const { userType, allData } = useContext(AuthContext);
  const { setHeaderText } = useUserContext();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    setHeaderText("Dashboard");

    const fetchTotalEmployees = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "employee")
        );
        const querySnapshot = await getDocs(q);
        setTotalEmployees(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchTotalEmployees();
  }, [setHeaderText]);

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

  const updateCheckInDocuments = async () => {
    try {
      const checkInsQuerySnapshot = await getDocs(collection(db, "checkIns"));

      checkInsQuerySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, "checkIns", docSnapshot.id);
        const docData = docSnapshot.data();

        const missingFields = [];

        if (!docData.checkInTime) missingFields.push("checkInTime");
        if (!docData.checkOutTime) missingFields.push("checkOutTime");
        if (!docData.totalWorkingHours) missingFields.push("totalWorkingHours");
        if (!docData.createdAt) missingFields.push("createdAt");
        if (!docData.date) missingFields.push("date");
        if (!docData.status) missingFields.push("status");

        if (missingFields.length > 0) {
          const updateData = {};

          if (!docData.checkInTime) updateData.checkInTime = null;
          if (!docData.checkOutTime) updateData.checkOutTime = null;
          if (!docData.totalWorkingHours) updateData.totalWorkingHours = "N/A";

          if (!docData.createdAt && docData.checkInTime !== null) {
            const createdAtDate = docData.checkInTime
            updateData.createdAt = createdAtDate;  
          }

          if (!docData.date && docData.checkInTime !== null) {
            let parsedDate;
            
            if (docData.checkInTime.seconds) {
              parsedDate = docData.checkInTime.toDate();
            } else {
              parsedDate = new Date(docData.checkInTime);
            }
          
            if (!isNaN(parsedDate)) {
              const year = parsedDate.getFullYear();
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const day = String(parsedDate.getDate()).padStart(2, '0');
          
              const formattedDate = `${year}-${month}-${day}`;
              updateData.date = formattedDate;
            } else {
              console.warn("Invalid date format:", docData.checkInTime);
            }
          }else {
            updateData.date = "N/A"
          }

          if (!docData.status && docData.checkInTime !== null && docData.checkOutTime !== null){
            updateData.status = "present"
          }else{
            updateData.status = "N/A";
          } 

          await updateDoc(docRef, updateData);
        }
      });
      alert("All fields are updated for all employees.");
    } catch (error) {
      console.error("Error updating check-in documents:", error);
    }
  };

  const updateUsersDocuments = async () => {
    try {
      const usersRef = collection(db, "users");
      const employeeQuery = query(usersRef, where("role", "==", "employee"));
      const querySnapshot = await getDocs(employeeQuery);

      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await updateDoc(docRef, { status: "active" });
      });
  
      alert("status updated to 'active' for all employees.");
    } catch (error) {
      console.error("Error updating documents: ", error);
      alert("Failed to update documents.");
    }
  };
  return (
    <div className="flex ">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white">
          <div className="flex shadow p-5 m-4 gap-3">
            <div className="flex w-full justify-between">
              <div className="flex">
                <div>
                  <h1 className="font-semibold text-xl text-blue-800">
                    Welcome Admin,
                  </h1>
                  <h1>You're logged in as an Admin!</h1>
                </div>
                <div className="flex items-end pl-2">
                  <button 
                    className="bg-gray-800 text-white font-semibold px-2 py-0.5 rounded text-xs hidden" 
                    onClick={updateCheckInDocuments}  
                  >
                    Database checkIns Refresh
                  </button>
                </div>
                <div className="flex items-end pl-2">
                  <button 
                    className="bg-gray-800 text-white font-semibold px-2 py-0.5 rounded text-xs hidden" 
                    onClick={updateUsersDocuments}  
                  >
                    Database users Refresh
                  </button>
                </div>
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
            <div className="w-full">
              <EmployeeCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}