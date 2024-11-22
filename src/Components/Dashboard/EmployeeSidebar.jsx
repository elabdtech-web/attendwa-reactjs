import React from "react";
import { FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MdDashboard,MdCoPresent } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FaRegMoneyBillAlt } from "react-icons/fa";

export default function Sidebar({ toggleSidebar, isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 min-h-screen transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 w-64 h-full md:relative md:translate-x-0 bg-white`}
    >
      <div className="flex justify-between p-4 pl-10">
        <img src="/logo.png" alt="" className="w-[150px]"/>
        <button onClick={toggleSidebar} className="text-xl">
          <FiX />
        </button>
      </div>
      <div className="p-[55px]">
        <ul className="space-y-8">
          <li>
            <Link to="/dashboard" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
              <MdDashboard className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Dashboard</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/attendance" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
             <MdCoPresent className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Attendance</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/announcements" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
             <GrUpdate className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Updates</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/salary" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
             <FaRegMoneyBillAlt className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Salary</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
