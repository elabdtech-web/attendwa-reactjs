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
    const collectionRef = collection(
      db,
      "projects"
    );
    const snapShot = await getDocs(collectionRef);
    const projectList = snapShot.docs.map((doc)=>doc.data()).filter((doc) => (
      doc.members.includes(employeeRegId)
    ))
    setProjects(projectList);
  }
  useEffect(() => {
    fetchUserProject();
  }, [employeeRegId]);

  return (
    <div className="bg-white shadow mx-[35px] mt-10">
      <div>
        <table className="w-full">
          <thead className="bg-primary">
            <tr>
              <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                Project Title
              </th>
              <th className="border w-[20%] text-center font-semibold text-[20px] py-2">
                Status
              </th>
              <th className="border w-[60%] text-center font-semibold text-[20px] py-2">
                Timeline
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="border text-center py-2">{project.projectTitle}</td>
                  <td className="border text-center py-2">{project.status}</td>
                  <td className="border text-center py-2"><ProjectProgressBar from={project.startDate} to={project.deadline}/></td>
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
