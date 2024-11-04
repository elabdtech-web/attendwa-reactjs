import React,{useState,useEffect} from 'react'
import HeaderDashboard from '../../Components/Dashboard/HeaderDashboard'
import Sidebar from "../../Components/Dashboard/EmployeeSidebar";
import { useUserContext } from "../../hooks/HeadertextContext";

export default function Attendance() {
  const {headerText,setHeaderText} = useUserContext()
  useEffect(()=>{
    setHeaderText("Setting")
  })
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-[#FFFFFF]">
          <h1 className="text-2xl font-semibold">
            Welcome to the Settings page 
          </h1>
          
        </div>
      </div>
    </div>
  )
}
