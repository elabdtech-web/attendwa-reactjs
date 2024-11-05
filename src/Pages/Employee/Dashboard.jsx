import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../hooks/AuthContext";
import { useUserContext } from "../../hooks/HeadertextContext";
import {collection,addDoc,updateDoc,doc,getDoc,Timestamp,query,where,getDocs,} from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";

export default function Dashboard() {
  const { userType, allData } = useContext(AuthContext);
  const { setHeaderText } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInDocId, setCheckInDocId] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);

  useEffect(() => {
    setHeaderText("Dashboard");
    const storedCheckInStatus = localStorage.getItem("isCheckedIn") === "true";
    const storedCheckInTime = localStorage.getItem("checkInTime");
    const storedCheckInDocId = localStorage.getItem("checkInDocId");

    if (storedCheckInStatus && storedCheckInTime) {
      setIsCheckedIn(true);
      setCheckInDocId(storedCheckInDocId);
      const savedCheckInTime = new Date(storedCheckInTime);
      setElapsedTime(Math.floor((Date.now() - savedCheckInTime) / 1000));
    } else {
      hasCheckedIn()
    }

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timerInterval;
    if (isCheckedIn) {
      console.log("Starting Time Interval")
      timerInterval = setInterval(() => {
        const savedCheckInTime = new Date(localStorage.getItem("checkInTime"));
        setElapsedTime(Math.floor((Date.now() - savedCheckInTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }

    return () => clearInterval(timerInterval);
  }, [isCheckedIn]);

  
const hasCheckedIn = async () => {
  setLoading(true);
  try {
    const currentDate = new Date();
    const formattedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const q = query(
      collection(db, "checkIns"),
      where("userId", "==", allData.regId),
      where("checkInTime", ">=", formattedDate),
      where("checkInTime", "<", new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000))
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
     return {
      id:doc.id,
      ...doc.data()
     }
    })

    if(data.length < 1){
      console.log("No data found.")
      setIsCheckedIn(false)
    }else{
      if(data[0].checkOutTime){
        console.log("USER HAS COMPLETED TODAYS")
        setIsCheckedIn(false);
        setTotalTime(data[0].totalWorkingHours)
      }else {
        console.log("USER HAS ONLY CHECKED IN BUT NOT CHECKED OUT SO CONTINUE THE TIMER")
        setIsCheckedIn(true);
        localStorage.setItem("checkInTime" , new Date(data[0].checkInTime.seconds * 1000).toISOString())
        localStorage.setItem("isCheckedIn", "true");
        localStorage.setItem("checkInDocId",data[0].id );
      }
    }
  } catch (error) {
    console.error("Error checking today's check-in status:", error);
  }
  setLoading(false);
};

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const checkInTime = Timestamp.now();
      const docRef = await addDoc(collection(db, "checkIns"), {
        userId: allData.regId,
        checkInTime,
        checkOutTime: null,
        totalWorkingHours: null,
      });
      localStorage.setItem("isCheckedIn", "true");
      localStorage.setItem("checkInTime", checkInTime.toDate().toISOString());
      localStorage.setItem("checkInDocId", docRef.id);
      setCheckInDocId(docRef.id);
      setIsCheckedIn(true);
      setTotalTime(null);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error during check-in:", error);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const checkOutTime = Timestamp.now();
      const userRef = doc(db, "checkIns", checkInDocId);

      const checkInDoc = await getDoc(userRef);
      if (!checkInDoc.exists()) {
        console.error("Check-in document does not exist.");
        return;
      }

      const { checkInTime } = checkInDoc.data();
      const checkInDate = checkInTime.toDate();
      const checkOutDate = checkOutTime.toDate();

      const totalWorkingMilliseconds = checkOutDate - checkInDate;
      const totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s`;

      await updateDoc(userRef, { checkOutTime, totalWorkingHours });

      setTotalTime(totalWorkingHours);

      localStorage.removeItem("isCheckedIn");
      localStorage.removeItem("checkInTime");
      localStorage.removeItem("checkInDocId");

      setIsCheckedIn(false);
    } catch (error) {
      console.error("Error during check-out:", error);
    }
    setLoading(false);
  };

  const formatElapsedTime = (timeInSeconds) => {
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2,"0");
    const seconds = String(timeInSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const openCheckInDialog = () => {
    setShowDialog(true); // Added to open the dialog for check-in confirmation
  };

  const closeCheckInDialog = () => {
    setShowDialog(false); // Added to close the dialog
  };

  const openCheckOutDialog = () => {
    setShowCheckOutDialog(true); // Show check-out confirmation dialog
  };

  const closeCheckOutDialog = () => {
    setShowCheckOutDialog(false); // Close check-out confirmation dialog
  };

  return (
    <div className="flex bg-[#FFFFFF] h-screen">
      <div className="flex-1">
        <div className="flex bg-white p-5 m-4 gap-3 shadow">
          <div className="w-[4%] pt-1">
            <img src={allData.image} alt="User" />
          </div>
          <div className="flex w-full justify-between">
            <div>
              <h1 className="font-semibold text-xl text-blue-800">
                Welcome {allData.fullName ? allData.fullName : "Guest"},
              </h1>
              <h1>You're logged in as an employee!</h1>
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

        <div className="flex justify-between items-center shadow p-5 mx-4 mt-12">
          <div>
            <h1 className="font-semibold text-[18px]">Today's Attendance</h1>
            {isCheckedIn ? (
              <div className="flex gap-3">
                <p className="font-medium text-[14px]">Please check out</p>
                {loading ? (
                  <div className="ml-2 text-[14px]">
                    <span>Loading...</span>
                  </div>
                ) : (
                   <button onClick={openCheckOutDialog} className="font-medium text-[14px] text-blue-500">
                    Check Out
                  </button> 
                )}
              </div>
            ) : totalTime ? (
              <div className="flex gap-3">
                <p className="font-medium text-[17px] text-blue-800">
                  Your Total Working Hours are:
                </p>
                <h2 className="text-[18px] font-semibold leading-6">
                  {totalTime}
                </h2>
              </div>
            ) : (
              <div className="flex gap-3">
                <p className="font-medium text-[14px]">
                  You are not checked in today yet.
                </p>
                {loading ? (
                  <div className="ml-2 text-[14px]">
                    <span>Loading...</span>
                  </div>
                ) : (
                  <button onClick={openCheckInDialog} className="font-medium text-[14px] text-blue-500">
                    Check In
                  </button>
                )}
              </div>
            )}
          </div>
          {totalTime===null &&(
          <div className="text-xl font-semibold">
            {formatElapsedTime(elapsedTime)}
          </div>
        )}
        </div>
      </div>
      {showDialog && ( // Added the dialog rendering condition
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-In</h2>
            <p className="mb-4">Are you sure you want to check in?</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCheckIn();
                  closeCheckInDialog(); // Close dialog on confirmation
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={closeCheckInDialog} // Added button to close dialog without checking in
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

{showCheckOutDialog && ( // Added check-out confirmation dialog
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-Out</h2>
            <p className="mb-4">Are you sure you want to check out?</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCheckOut();
                  closeCheckOutDialog(); // Close dialog on confirmation
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={closeCheckOutDialog} // Close dialog without checking out
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
