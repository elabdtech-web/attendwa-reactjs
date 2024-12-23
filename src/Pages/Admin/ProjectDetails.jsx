import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../hooks/AuthContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const {userType} = useContext(AuthContext);

  const fetchProjectDetails = async () => {
    try {
      const projectRef = doc(db, "projects", id);
      const docSnapshot = await getDoc(projectRef);

      if (docSnapshot.exists()) {
        setProject(docSnapshot.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      toast.error("Error fetching project details");
      console.error("Error fetching project details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleClose = () => {
    if (userType === "admin"){
    navigate("/a-dashboard/a-projects");
    }
    if (userType === "employee"){
      navigate("/dashboard");
    }
  };

  return (
    <div className="base:m-6 m-auto base:w-[75%] w-[95%] mt-10">
      {loading ? (
        <p>Loading project details...</p>
      ) : project ? (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Project Details</h1>
          <div className="flex gap-2 items-center justify-end mb-4">
            <label className="block text-lg font-semibold underline">
              Date :
            </label>
            <p className="text-base">
              {project.created_at.toDate().toLocaleDateString("en-GB")}
            </p>
          </div>

          <div className="border shadow rounded-xl p-5">
            <div className="flex justify-between">
              <div className="mb-4 flex items-center gap-2">
                <label className="block text-xl font-semibold underline">
                  Title :
                </label>
                <p className="text-lg">{project.projectTitle}</p>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <label className="block text-xl font-semibold underline">
                  Status :
                </label>
                <p className="text-lg">{project.status}</p>
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap mb-4">
              <div className="flex items-center text-md gap-2 ">
                <label className="block font-semibold underline">
                  Start Date :
                </label>
                <p className="">{project.startDate}</p>
              </div>

              <div className="text-md flex items-center gap-2">
                <label className="block  font-semibold underline">
                  Deadline :
                </label>
                <p className="">{project.deadline}</p>
              </div>
            </div>

            <div className="gap-2">
              <label className="block text-lg font-semibold underline">
                Description :
              </label>
              <p
                className="text-html"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>

            <div className="mt-4">
              <label className="block text-lg font-semibold underline">
                Members :
              </label>
              <ul>
                {project.members.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  handleClose();
                }}
                className="bg-primary text-white px-4 py-1 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>No project found.</p>
      )}
    </div>
  );
}
