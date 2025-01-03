import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../hooks/AuthContext";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { startOfDay, endOfDay, format } from "date-fns";
import { toast } from "react-toastify";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Calendar from "../../Components/Calendar";
import ProjectCard from "../../Components/Dashboard/ProjectCard";

export default function Dashboard() {
  const { userType, allData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkInDocId, setCheckInDocId] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [checklist, setChecklist] = useState({
    pushCode: false,
    pushTestFlight: false,
    meetBoss: false,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userType == "employee") {
      checkTodayCheckInStatus();
    }
  }, []);

  useEffect(() => {
    if (userType === "employee") fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    try {
      const startOfMonth = format(
        new Date(selectedYear, selectedMonth, 1),
        "yyyy-MM-dd"
      );
      const endOfMonth = format(
        new Date(selectedYear, selectedMonth + 1, 0),
        "yyyy-MM-dd"
      );

      const q = query(
        collection(db, "checkIns"),
        where("userId", "==", allData.regId),
        where("date", ">=", startOfMonth),
        where("date", "<=", endOfMonth)
      );

      const querySnapshot = await getDocs(q);

      const checkIns = querySnapshot.docs.map((doc) => doc.data());
      let totalHours = 0;
      let totalMinutes = 0;
      let workFromHome = 0;
      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let holidays = 0;
      let workingDaysInMonth = 30;

      const allStatusDates = new Set();

      checkIns.forEach((checkIn) => {
        const { status, totalWorkingHours: twh, date } = checkIn;

        if (
          date &&
          (status === "present" ||
            status === "home" ||
            status === "absent" ||
            status === "leave")
        ) {
          allStatusDates.add(date);

          if (status === "present" || status === "home") {
            if (twh) {
              const hours = parseInt(twh.split("h")[0].trim()) || 0;
              const minutes =
                parseInt(twh.split("m")[0].split("h")[1].trim()) || 0;

              totalHours += hours;
              totalMinutes += minutes;

              if (totalMinutes >= 60) {
                totalHours += Math.floor(totalMinutes / 60);
                totalMinutes = totalMinutes % 60;
              }
            }
          }

          if (status === "present") presentDays++;
          if (status === "home") workFromHome++;
          if (status === "absent") absentDays++;
          if (status === "leave") leaveDays++;
        }
        if (status === "holiday") holidays++;
      });

      const formattedTotalWorkingHours = `${String(totalHours).padStart(
        2,
        "0"
      )}h : ${String(totalMinutes).padStart(2, "0")}m`;
      const percentageOfWorkingDays = Math.floor(
        ((workingDaysInMonth - absentDays) / workingDaysInMonth) * 100
      );
      const percentageOfLeaveDays = Math.floor((leaveDays / 2) * 100);
      setAttendanceSummary({
        presentDays,
        absentDays,
        leaveDays,
        workFromHome,
        holidays,
        workingDaysInMonth,
        totalDutyHours: (allStatusDates.size - leaveDays) * 9,
        totalWorkingHours: formattedTotalWorkingHours,
        percentageOfWorkingDays,
        percentageOfLeaveDays,
      });
    } catch (error) {
      toast.error(`Error fetching attendance data: ${error.message}`);
      console.log("Error fetching attendance data:", error);
    }
  };
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
      }
      if (data.length > 0) {
        const checkInData = data[0];
        if (checkInData.checkOutTime) {
          setIsCheckedIn(false);
          setTotalTime(checkInData.totalWorkingHours);
        }
        if (!checkInData.checkOutTime) {
          setIsCheckedIn(true);
          setCheckInDocId(checkInData.id);
          const savedCheckInTime = checkInData.checkInTime.toDate();
          setElapsedTime(Math.floor((Date.now() - savedCheckInTime) / 1000));
          setCheckInTime(savedCheckInTime);
        }
      }
    } catch (error) {
      toast.error("Error checking today's check-in status:", error);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const createdAt = serverTimestamp();
      const formattedDate = new Date().toISOString().split("T")[0];

      const docRef = await addDoc(collection(db, "checkIns"), {
        userId: allData.regId,
        createdAt,
        checkInTime: serverTimestamp(),
        checkOutTime: null,
        totalWorkingHours: null,
        status: "present",
        date: formattedDate,
      });
      const savedDoc = await getDoc(docRef);
      if (!savedDoc.exists()) {
        toast.error("Failed to retrieve saved check-in data.");
      }

      const checkInData = savedDoc.data();
      const resolvedCheckInTime = checkInData.checkInTime.toDate();

      setCheckInDocId(docRef.id);
      setIsCheckedIn(true);
      setCheckInTime(resolvedCheckInTime);
      setTotalTime(null);
      setElapsedTime(0);
      toast.success(
        "Check-in Time :" +
          resolvedCheckInTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );
    } catch (error) {
      toast.error("Error during check-in:", error);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "checkIns", checkInDocId);
      const checkInDoc = await getDoc(userRef);
      if (!checkInDoc.exists()) {
        toast.error("Check-in document does not exist.");
        return;
      }

      const { checkInTime } = checkInDoc.data();
      if (!checkInTime) {
        toast.error("Check-in time not available in document.");
      }
      const checkInDate = checkInTime.toDate();
      const checkOutTime = serverTimestamp();

      await updateDoc(userRef, { checkOutTime });

      const updatedDoc = await getDoc(userRef);
      const resolvedCheckOutTime = updatedDoc.data().checkOutTime.toDate();

      toast.success(
        "Check-out Time: " +
          resolvedCheckOutTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );

      const totalWorkingMilliseconds = resolvedCheckOutTime - checkInDate;
      const totalWorkingHours = `
        ${Math.floor(totalWorkingMilliseconds / (1000 * 60 * 60))}h 
        ${Math.floor(
          (totalWorkingMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        )}m 
        ${Math.floor((totalWorkingMilliseconds % (1000 * 60)) / 1000)}s`;

      await updateDoc(userRef, { totalWorkingHours });
      setTotalTime(totalWorkingHours);
      setIsCheckedIn(false);
    } catch (error) {
      toast.error("Error during check-out:", error);
    }
    setLoading(false);
  };

  const formatElapsedTime = (timeInSeconds) => {
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(timeInSeconds % 60).padStart(2, "0");
    return `${hours}h : ${minutes}m : ${seconds}s`;
  };

  const allChecked = Object.values(checklist).every((value) => value);

  const handleChecklistChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prevChecklist) => ({
      ...prevChecklist,
      [name]: checked,
    }));
  };

  const getGreeting = () => {
    const currentHour = currentDateTime.getHours();
    if (currentHour >= 0 && currentHour < 12) return "Good Morning!";
    if (currentHour >= 12 && currentHour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  const handleAlert = () => {
    alert(
      "Formula Used For This Progress Bar Is: \n(Total Days In Month - Absent Days) * 100 / Total Days In Month"
    );
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month === "" ? null : parseInt(month));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const openCheckInDialog = () => setShowDialog(true);
  const closeCheckInDialog = () => setShowDialog(false);
  const openCheckOutDialog = () => setShowCheckOutDialog(true);
  const closeCheckOutDialog = () => setShowCheckOutDialog(false);

  return (
    <div className=" bg-white h-screen">
      <div className="flex bg-white xsm:px-5 px-3 sm:m-4 m-1 gap-3">
        <div className="flex w-full justify-between max-lg:flex-col gap-5">
          <div className="w-full">
            <ProjectCard />
          </div>

          <div className="lg:w-[28%] max-lg:mt-10">
            <div
              className="shadow w-full 
          px-1 max-xsm:p-1 mb-2 pb-3"
            >
              <div className="font-sans font-medium text-gray-500 pb-3 max-lg:flex gap-2 max-lg:px-6 xl:flex xl:justify-between">
                <div className="flex gap-1 lg:text-[12px] xl:text-[13px]">
                  <p>
                    {currentDateTime.toLocaleDateString("en-GB", {
                      weekday: "long",
                    })}
                    ,
                  </p>
                  <p>
                    {currentDateTime.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="lg:text-[12px] xl:text-[13px]">
                  {currentDateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="lg:text-center max-lg:px-20 max-sm:px-0 max-sm:text-center">
                <div>
                  <h1 className="font-semibold text-xl mb-1">
                    {allData.fullName ? allData.fullName : "Guest"}
                  </h1>
                  <h1 className="font-semibold text-primary text-sm">
                    {getGreeting()}
                  </h1>
                </div>
              </div>
            </div>
            <div className="py-3 shadow">
              <div>
                {isCheckedIn ? (
                  <div className="">
                    <div className="lg:text-center lg:px-1 text-gray-500 pb-2 max-lg:flex gap-5 sm:px-14 max-sm:justify-center">
                      <p className="font-medium text-[14px]">Check In time</p>
                      <p className="text-[14px] font-medium">
                        {checkInTime?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    {/* <div className="text-center text-gray-500  ">
                      <p className="font-medium text-[14px] ">
                        Check Out time
                      </p>
                      <p className="font-medium ">-- : -- : --</p>
                    </div> */}
                    <div className="xl:text-center max-lg:px-6 max-sm:text-center px-2">
                      {loading ? (
                        <div className="ml-2 text-[14px]">
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <button
                          onClick={openCheckOutDialog}
                          className="font-medium text-[14px] bg-primary lg:w-full max-lg:px-20 py-2 rounded-lg text-white"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </div>
                ) : totalTime ? (
                  <div className="text-center p-6 pt-6 w-full">
                    <p className="font-medium text-base text-primary">
                      Your Total Working Hours are :
                    </p>
                    <h2 className="text-lg font-semibold pt-3">{totalTime}</h2>
                  </div>
                ) : (
                  <div className="xl:text-center max-lg:px-6 max-sm:text-center">
                    <p className="font-medium text-[14px] pb-4 ">
                      You are not checked in today yet.
                    </p>
                    {loading ? (
                      <div className="ml-2 text-[14px]">
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <button
                        onClick={openCheckInDialog}
                        className="font-medium text-[14px] bg-primary lg:w-full max-lg:px-20 py-2 rounded-lg text-white"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                )}
              </div>
              {totalTime === null && (
                <div className="lg2:text-xl md:text-md font-semibold lg:text-center pt-3 max-lg:px-20 max-sm:text-center lg:pl-2">
                  {formatElapsedTime(elapsedTime)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="xl:flex justify-between px-5 sm:mx-4 mt-10  gap-3">
        {/* Attendance Summary Card */}
        <div className="shadow xl:w-[70%] xsm:p-6 p-2">
          <div className="sm:flex justify-between">
            <p className="font-medium text-xl">Attendance</p>
            <div className="max-sm:flex justify-end max-sm:mt-5">
              <Calendar
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
            </div>
          </div>
          <div className="flex max-sm:flex-col max-xl:items-center justify-between mt-10 gap-5">
            <div
              className="sm:w-[25%] w-[80%] flex justify-center mx-auto cursor-pointer"
              onClick={handleAlert}
            >
              {attendanceSummary ? (
                <CircularProgressbar
                  value={attendanceSummary.percentageOfWorkingDays}
                  text={`${attendanceSummary.percentageOfWorkingDays}%`}
                  styles={{
                    text: { fill: "#41E975" },
                    path: { stroke: "#41E975" },
                  }}
                />
              ) : (
                <CircularProgressbar value={0} text={`0%`} />
              )}
            </div>
            <div className="sm:w-[60%] w-full mt-3 flex flex-col justify-center">
              {attendanceSummary ? (
                <div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Present:</p>
                    <p>{attendanceSummary.presentDays} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Work From Home:</p>
                    <p>{attendanceSummary.workFromHome} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Leave:</p>
                    <p>{attendanceSummary.leaveDays} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Absent:</p>
                    <p>{attendanceSummary.absentDays} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Holidays:</p>
                    <p>{attendanceSummary.holidays} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Working Days:</p>
                    <p>{attendanceSummary.workingDaysInMonth} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Duty Hours:</p>
                    <p>{attendanceSummary.totalDutyHours} hours</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 font-medium">Working Hours:</p>
                    <p>{attendanceSummary.totalWorkingHours} hours</p>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-gray-500">
                  Fetching attendance summary...
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Leave Summary Card */}
        <div className="shadow xl:w-[28%] xsm:p-6 p-2 max-xl:mt-10">
          <div className="flex justify-between">
            <p className="font-medium text-xl">Leave stats</p>
            {attendanceSummary ? (
              <p>{attendanceSummary.leaveDays} days</p>
            ) : (
              <p className="">Fetching...</p>
            )}
          </div>

          <div className="min-xl:mt-5 min-lg:mb-10 pt-10 mx-auto xl:w-[60%] base:w-[40%] w-[80%]">
            {attendanceSummary ? (
              <CircularProgressbar
                value={attendanceSummary.percentageOfLeaveDays}
                text={`${attendanceSummary.percentageOfLeaveDays}%`}
                styles={{
                  text: { fill: "#41E975" },
                  path: { stroke: "#41E975" },
                }}
              />
            ) : (
              <CircularProgressbar value={0} text={`0%`} />
            )}
          </div>
          <div className="mt-7 text-center hidden">
            <button className="font-medium text-[14px] bg-primary px-10 py-2 rounded-lg text-white">
              Apply For Leave
            </button>
          </div>
        </div>
      </div>

      {/* ------> Dialog Boxes <------- */}

      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-In</h2>
            <p className="mb-4">Are you sure you want to check in?</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCheckIn();
                  closeCheckInDialog();
                }}
                className="bg-primary text-white px-4 py-2 rounded mr-2"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-Out</h2>
            <p className="mb-4">Are you sure you want to check out?</p>
            <form className="space-y-2">
              <div>
                <input
                  type="checkbox"
                  id="pushCode"
                  name="pushCode"
                  className="mr-2"
                  onChange={handleChecklistChange}
                  checked={checklist.pushCode}
                />
                <label htmlFor="pushCode">Did you push code to GitHub?</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="pushTestFlight"
                  name="pushTestFlight"
                  className="mr-2"
                  onChange={handleChecklistChange}
                  checked={checklist.pushTestFlight}
                />
                <label htmlFor="pushTestFlight">
                  Did you push app to TestFlight?
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="meetBoss"
                  name="meetBoss"
                  className="mr-2"
                  onChange={handleChecklistChange}
                  checked={checklist.meetBoss}
                />
                <label htmlFor="meetBoss">
                  Did you meet with the boss before switching off your laptop?
                </label>
              </div>
            </form>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  handleCheckOut();
                  closeCheckOutDialog();
                }}
                disabled={!allChecked}
                className={`px-4 py-2 rounded mr-2 ${
                  allChecked
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
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
