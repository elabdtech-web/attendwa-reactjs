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

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userType == "employee"){
    checkTodayCheckInStatus();
    }
  }, []);

  useEffect(() => {
    let timerInterval;
    if (isCheckedIn) {
      timerInterval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isCheckedIn]);

  const checkTodayCheckInStatus = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const formattedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const nextDay = new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000);
      const q = query(
        collection(db, "checkIns"),
        where("userId", "==", allData.regId),
        where("checkInTime", ">=", formattedDate),
        where("checkInTime", "<", nextDay)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (data.length < 1) {
        setIsCheckedIn(false);
      } else {
        const checkInData = data[0];
        if (checkInData.checkOutTime) {
          setIsCheckedIn(false);
          setTotalTime(checkInData.totalWorkingHours);
        } else {
          setIsCheckedIn(true);
          setCheckInDocId(checkInData.id);
          const savedCheckInTime = checkInData.checkInTime.toDate();
          setElapsedTime(Math.floor((Date.now() - savedCheckInTime) / 1000));
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
      const createdAt = Timestamp.now();
      const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      const docRef = await addDoc(collection(db, "checkIns"), {
        userId: allData.regId,
        createdAt,
        checkInTime,
        checkOutTime: null,
        totalWorkingHours: null,
        status: "present",
        date: formattedDate,
      });
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
      const userRef = doc(db, "checkIns", checkInDocId);
      const checkInDoc = await getDoc(userRef);
      if (!checkInDoc.exists()) {
        console.error("Check-in document does not exist.");
        return;
      }

      const { checkInTime } = checkInDoc.data();
      const checkInDate = checkInTime.toDate();
      const checkOutTime = Timestamp.now();
      const checkOutDate = checkOutTime.toDate();

      const totalWorkingMilliseconds = checkOutDate - checkInDate;
      const totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor(
          (totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        )}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s`;

      await updateDoc(userRef, { checkOutTime, totalWorkingHours });

      setTotalTime(totalWorkingHours);
      setIsCheckedIn(false);
    } catch (error) {
      console.error("Error during check-out:", error);
    }
    setLoading(false);
  };

  const formatElapsedTime = (timeInSeconds) => {
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(  2,  "0");
    const seconds = String(timeInSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const openCheckInDialog = () => setShowDialog(true);
  const closeCheckInDialog = () => setShowDialog(false);
  const openCheckOutDialog = () => setShowCheckOutDialog(true);
  const closeCheckOutDialog = () => setShowCheckOutDialog(false);
  return (
    <div className="flex bg-[#FFFFFF] h-screen">
      <div className="flex-1">
        <div className="flex bg-white p-5 m-4 gap-3 shadow">
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
                  <button
                    onClick={openCheckOutDialog}
                    className="font-medium text-[14px] text-blue-500"
                  >
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
                  <button
                    onClick={openCheckInDialog}
                    className="font-medium text-[14px] text-blue-500"
                  >
                    Check In
                  </button>
                )}
              </div>
            )}
          </div>
          {totalTime === null && (
            <div className="text-xl font-semibold">
              {formatElapsedTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-In</h2>
            <p className="mb-4">Are you sure you want to check in?</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCheckIn();
                  closeCheckInDialog();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={closeCheckInDialog}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckOutDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-Out</h2>
            <p className="mb-4">Are you sure you want to check out?</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCheckOut();
                  closeCheckOutDialog();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={closeCheckOutDialog}
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