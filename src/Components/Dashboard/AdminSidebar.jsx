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
      <div className="w-64 h-screen bg-gray-800 text-white p-6">
        <ul className="space-y-4">
          <li>
            <Link to="/a-dashboard" className="hover:text-gray-400">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/employees" className="hover:text-gray-400">
              Employees
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/tasks" className="hover:text-gray-400">
              Tasks
            </Link>
          </li>
          <li>
            <Link to="/a-dashboard/a-settings" className="hover:text-gray-400">
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
