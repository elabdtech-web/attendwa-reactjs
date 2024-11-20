import React from "react";
import { FiX } from "react-icons/fi";
import {Link} from "react-router-dom"
import { MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";

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
            <Link to="/a-dashboard" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
              <MdDashboard className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Dashboard</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/employees" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
              <FaPeopleGroup className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Employees</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/tasks" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
              <FaTasks className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Tasks</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/a-settings" className="hover:text-primary">
            <div className="flex items-center gap-3 hover:underline">
              <IoSettings className="w-[20px] size-10"/>
              <p className='font-semibold text-[18px]'>Settings</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
