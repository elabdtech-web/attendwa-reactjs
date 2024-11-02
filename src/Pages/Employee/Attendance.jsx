import React, { useState, useEffect, useContext } from 'react';
import { useUserContext } from "../../hooks/HeadertextContext";
import { getAuth } from "firebase/auth";
import { db } from "../../Firebase/FirebaseConfig"; 
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { AuthContext } from '../../hooks/AuthContext';

export default function Attendance() {
  const { headerText, setHeaderText } = useUserContext();
  const { allData } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    setHeaderText("Attendance");

    async function fetchUserDetails() {
      if (allData.regId) {
        const userRef = collection(db, "checkIns");
        const userQuery = query(
          userRef,
          where("userId", "==", allData.regId),
          orderBy("checkInTime", "desc"),
          limit(7)
        );

        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const data = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAttendanceData(data); // Set fetched data directly
        } else {
          console.error("No user found for this UID");
        }
      }
    }

    fetchUserDetails();
  }, [allData.regId, setHeaderText]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-semibold">
            Welcome to the Attendance page 
          </h1>
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Day</th>
                <th className="py-2">Time In</th>
                <th className="py-2">Time Out</th>
                <th className="py-2">Working Hours</th>
                <th className="py-2">On Leave</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((entry) => ( 
                <tr key={entry.id}>
                  <td className="py-2 text-center">{new Date(entry.checkInTime.toDate()).toLocaleDateString()}</td>
                  <td className="py-2 text-center">{new Date(entry.checkInTime.toDate()).toLocaleString('en-us', { weekday: 'long' })}</td>
                  <td className="py-2 text-center">{entry.checkInTime ? new Date(entry.checkInTime.toDate()).toLocaleTimeString() : "N/A"}</td>
                  <td className="py-2 text-center">{entry.checkOutTime ? new Date(entry.checkOutTime.toDate()).toLocaleTimeString() : "N/A"}</td>
                  <td className="py-2 text-center">{entry.totalWorkingHours || "N/A"}</td>
                  <td className="py-2 text-center">{entry.onLeave ? "Yes" : "No"}</td>
                  <td className="py-2 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
