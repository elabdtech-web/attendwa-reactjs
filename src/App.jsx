import {useEffect,useContext} from 'react'
import Home from "./Pages/Frontend/Home";
import Login from "./Pages/Auth/Login";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Employee/Dashboard";
import Attendance from "./Pages/Employee/Attendance";
import Employees from "./Pages/Admin/Employees";
import Settings from "./Pages/Employee/Setting";
import Salary from "./Pages/Employee/Salary"
import FormPage from "./Pages/Auth/FormPage";
import EmployeeLayout from "./Components/EmployeeLayout";
import {AuthContext} from "./hooks/AuthContext"
import AdminLayout from './Components/AdminLayout';
import DashboardAdmin from './Pages/Admin/DashboardAdmin';
import Tasks from './Pages/Admin/Tasks';
import SettingAdmin from './Pages/Admin/SettingAdmin'
import Profile from './Pages/Employee/Profile';
export default function App() {
  const {userType} = useContext(AuthContext)
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/a-dashboard" element={<AdminLayout/>}>
          <Route index element={<DashboardAdmin/>}/>
          <Route path="tasks" element={<Tasks/>}/>
          <Route path="employees" element={<Employees />}>
              <Route path="FormPage" element={<FormPage />} />
          </Route>
          <Route path="a-settings" element={<SettingAdmin />} />
        </Route>

        <Route path="/dashboard" element={<EmployeeLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />  
          <Route path="settings" element={<Settings />} />
          <Route path="salary" element={<Salary/>} />
          <Route path="profile" element={<Profile/>}/>
        </Route>
      </Routes>
    </div>
  );
}