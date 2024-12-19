import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {Link} from "react-router-dom"
import { db } from "../../Firebase/FirebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function ProjectsAdmin() {
  const navigate = useNavigate();
  const isProjectPage = location.pathname == "/a-dashboard/a-projects";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    navigate("/a-dashboard/a-projects/projectForm");
  };

  useEffect(() => {
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectCollection = collection(db, "projects");
      const projectSnapshot = await getDocs(projectCollection);
      const projectList = projectSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching projects");
      console.error("Error fetching projects:", error);
    }
  };
  const handleStatusChange = async (e, projectId) => {
    const newStatus = e.target.value;

    try {
      await updateDoc(doc(db, "projects", projectId), {
        status: newStatus,
      });
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Error updating status:", error.message);
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast.success("Project deleted successfully!");
      window.location.reload();
    } catch (error) {
      toast.error("Error deleting project");
      console.log("Error deleting project:", error);
    }
  };

  return (
    <div className="mt-[3%] mx-[10%] ">
      {isProjectPage ? (
        <>
          <div className="flex justify-between mb-3">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <button
              className=" bg-primary text-white font-semibold px-3 py-2 rounded-lg"
              onClick={handleClick}
            >
              Add New
            </button>
          </div>
          <table className="w-full">
            {/* Table header */}
            <thead className="bg-primary">
              <tr>
                <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                  Title
                </th>
                <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                  Employees
                </th>
                <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                  Status
                </th>
                <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                  Action
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-2 text-xl">
                    Loading...
                  </td>
                </tr>
              ) : (
                <>
                  {projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-2 text-xl font-semibold"
                      >
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    <>
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td className="border text-center py-2">
                            {project.projectTitle}
                          </td>
                          <td className="border text-center py-2">
                            {project.members.join(", ")}
                          </td>
                          <td className="border text-center py-2">
                            <select
                              value={project.status}
                              onChange={(e) =>
                                handleStatusChange(e, project.id)
                              }
                              className="border p-1 bg-primary rounded"
                            >
                              <option value="active">Active</option>
                              <option value="onhold">On Hold</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="border text-center py-2">
                            <button
                              className="border bg-primary text-white text-[12px] px-2 py-1 rounded-lg"
                            >
                              <Link to={`./${project.id}`}>View</Link>
                            </button>
                            <button
                              className="border bg-primary text-white text-[12px] px-2 py-1 rounded-lg mx-2"
                              >
                                <Link to={`./${project.id}/edit`}>Edit</Link>
                              </button>
                            <button
                              className="border bg-primary text-white text-[12px] px-2 py-1 rounded-lg"
                              onClick={() => handleDelete(project.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
