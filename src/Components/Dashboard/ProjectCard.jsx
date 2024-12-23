import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../hooks/AuthContext";
import { collection, where, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import ProjectProgressBar from "./ProjectProgressBar";

export default function ProjectCard() {
  const [projects, setProjects] = useState([]);
  const data = useContext(AuthContext);
  const employeeRegId = data.allData.regId;

  async function fetchUserProject() {
    const collectionRef = collection(db, "projects");
    const snapShot = await getDocs(collectionRef);
  
    const projectList = snapShot.docs
      .map((doc) => ({
        id: doc.id, 
        ...doc.data(), 
      }))
      .filter((doc) => doc.members.includes(employeeRegId)); 

    setProjects(projectList);
  }
  useEffect(() => {
    fetchUserProject();
  }, [employeeRegId]);

  const handleProjectClick = (id) => {
    window.location.href = `/dashboard/${id}`;
  };

  return (
    <div className="bg-white shadow">
      <div>
        <table className="w-full">
          <thead className="bg-primary">
            <tr>
              <th className="border w-[15%] text-center font-semibold text-[20px] max-sm:text-[12px] py-2">
                Project Title
              </th>
              <th className="border w-[17%] text-center font-semibold text-[20px] max-sm:text-[12px] py-2">
                Start Date
              </th>
              <th className="border xsm:w-[45%] w-[25%] text-center font-semibold text-[20px] max-sm:text-[12px] py-2">
                Timeline
              </th>
              <th className="border w-[15%] text-center font-semibold text-[20px] max-sm:text-[12px] py-2">
                Deadline
              </th>
              <th className="border w-[10%] text-center font-semibold text-[20px] max-sm:text-[12px] py-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} onClick={() => {handleProjectClick(project.id)}} className="cursor-pointer hover:bg-primary max-sm:text-[10px]">
                  <td className="border text-center py-2">{project.projectTitle}</td>
                  <td className="border text-center py-2">{project.startDate}</td>
                  <td className="border text-center py-2"><ProjectProgressBar from={project.startDate} to={project.deadline}/></td>
                  <td className="border text-center py-2">{project.deadline}</td>
                  <td className="border text-center py-2">{project.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-3 text-xl">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
