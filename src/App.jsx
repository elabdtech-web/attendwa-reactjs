import { useEffect, useContext } from "react";
import Home from "./Pages/Frontend/Home";
import Login from "./Pages/Auth/Login";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Employee/Dashboard";
import Attendance from "./Pages/Employee/Attendance";
import Employees from "./Pages/Admin/Employees";
import Salary from "./Pages/Employee/Salary";
import FormPage from "./Pages/Auth/FormPage";
import EmployeeLayout from "./Components/EmployeeLayout";
import { AuthContext } from "./hooks/AuthContext";
import AdminLayout from "./Components/AdminLayout";
import DashboardAdmin from "./Pages/Admin/DashboardAdmin";
import Tasks from "./Pages/Admin/Tasks";
import SalaryAdmin from "./Pages/Admin/SalaryAdmin";
import Profile from "./Pages/Employee/Profile";
import EmployeeDetails from "./Pages/Admin/EmployeeDetails";
import ForgetPasswordPage from "./Pages/Auth/ForgetPasswordPage";
import ChangePassword from "./Pages/Employee/ChangePassword";
import EditPage from "./Pages/Admin/EditEmployeePage";
import Announcements from "./Pages/Admin/Announcement";
import AddNewAnnouncement from "./Pages/Admin/AddNewAnnouncement";
import AnnouncementDetails from "./Pages/Admin/AnnouncementDetails";
import SalaryCalculation from "./Pages/Admin/SalaryCalculation";
import ProjectsAdmin from "./Pages/Admin/ProjectsAdmin";
import ProjectForm from "./Pages/Auth/ProjectForm";
import ProjectDetails from "./Pages/Admin/ProjectDetails";
import EditProject from "./Pages/Admin/EditProject";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgetPasswordPage" element={<ForgetPasswordPage/>}/>
        <Route path="/a-dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="a-projects" element={<ProjectsAdmin/>}>
            <Route path="projectForm" element={<ProjectForm />} />
            <Route path=":id" element={<ProjectDetails />} />
            <Route path=":id/edit" element={<EditProject />} />
          </Route>
          <Route path="employees" element={<Employees />}>
            <Route path="FormPage" element={<FormPage />} />
            <Route path=":id" element={<EmployeeDetails />}/>
            <Route path=":id/edit" element={<EditPage />} /> 
            <Route path=":id/salary" element={<SalaryCalculation/>} />
          </Route>
          <Route path="a-salary" element={<SalaryAdmin />} />
          <Route path="announcements" element={<Announcements/>} >
            <Route path="addNewAnnouncement" element={<AddNewAnnouncement/>}/>
            <Route path=":id" element={<AnnouncementDetails />} />
            </Route>
        </Route>

        <Route path="/dashboard" element={<EmployeeLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="salary" element={<Salary />} />
          <Route path="profile" element={<Profile />} />
          <Route path="changePassword" element={<ChangePassword/>}/>
          <Route path="announcements" element={<Announcements/>} >
            <Route path="addNewAnnouncement" element={<AddNewAnnouncement/>}/>
            <Route path=":id" element={<AnnouncementDetails />} />
            </Route>
        </Route>
      </Routes>
    </div>
  );
}
