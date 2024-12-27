import React from "react";
import { FiX } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { GrAnnounce } from "react-icons/gr";

export default function Sidebar({ toggleSidebar, isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 min-h-screen transform bg-white shadow ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 w-64 h-full md:relative md:translate-x-0`}
    >
      <div className="flex justify-between p-4 pl-10">
        <img src="/logo.png" alt="" className="w-[150px]" />
        <button onClick={toggleSidebar} className="text-xl">
          <FiX />
        </button>
      </div>
      <div className="p-[45px]">
        <ul className="space-y-8">
          <li>
            <NavLink to="/a-dashboard" className="hover:text-primary" end>
              <div className="flex items-center gap-3 hover:underline">
                <MdDashboard className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Dashboard</p>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to="/a-dashboard/employees" className="hover:text-primary">
              <div className="flex items-center gap-3 hover:underline">
                <FaPeopleGroup className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Employees</p>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/a-dashboard/a-projects"
              className="hover:text-primary"
            >
              <div className="flex items-center gap-3 hover:underline">
                <FaTasks className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Projects</p>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to="/a-dashboard/a-salary" className="hover:text-primary">
              <div className="flex items-center gap-3 hover:underline">
                <FaRegMoneyBillAlt className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Salary</p>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/a-dashboard/announcements"
              className="hover:text-primary"
            >
              <div className="flex items-center gap-3 hover:underline">
                <GrAnnounce className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Announcements</p>
              </div>
            </NavLink>
          </li>
          <li className="hidden">
            <NavLink to="/a-dashboard/tasks" className="hover:text-primary">
              <div className="flex items-center gap-3 hover:underline">
                <FaTasks className="w-[20px] size-10" />
                <p className="font-semibold text-[18px]">Tasks</p>
              </div>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
