import React from "react";
import { FiX } from "react-icons/fi";
import {Link} from "react-router-dom"

export default function Sidebar({ toggleSidebar }) {
  return (
    <div className=" text-white">
      <div className="flex justify-between items-center p-4 bg-gray-900">
        <h2 className="text-2xl font-semibold">ELABD</h2>
        <button onClick={toggleSidebar} className="text-xl">
          <FiX />
        </button>
      </div>
      <div className="w-64 h-full bg-gray-800 text-white p-6">
        <ul className="space-y-4">
          <li>
            <Link to="/dashboard" className="hover:text-gray-400">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/dashboard/attendance" className="hover:text-gray-400">
              Attendance
            </Link>
          </li>
          <li>
            <Link to="/dashboard/settings" className="hover:text-gray-400">
              Settings
            </Link>
          </li>
          <li>
            <Link to="/dashboard/salary" className="hover:text-gray-400">
              Salary
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
