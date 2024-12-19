import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MultipleSelectChip from "../../Components/MultiSelect";
import { collection, doc, getDoc, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { toast } from "react-toastify";
import CustomInputField from "../../Components/CustomInputField";
import { useParams, useNavigate } from "react-router-dom";

export default function EditEmployee() {
  const [projectData, setProjectData] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectData(id);
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const userRef = doc(db, "projects", id);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        setProjectData({ id: userSnapshot.id, ...userSnapshot.data() });
      }
    } catch (error) {
      toast.error("Error fetching employee data");
    }
  };

  useEffect(() => {
    if (projectData) {
      setProjectTitle(projectData.projectTitle || "");
      setDescription(projectData.description || "");
      setStartDate(projectData.startDate || "");
      setDeadline(projectData.deadline || "");
      setMembers(projectData.members || []);
      setStatus(projectData.status || "active");
    }
  }, [projectData]);

  const validateFields = () => {
      let validationErrors = {};
  
      if (!projectTitle.trim()) {
        validationErrors.projectTitle = "Project title is required";
      }
      if (!startDate) {
        validationErrors.startDate = "Start date is required";
      }
      if (!deadline) {
        validationErrors.deadline = "Deadline is required";
      }
  
      if (members.length === 0) {
        validationErrors.members = "Members are required";
      }
      
  
      Object.values(validationErrors).forEach((errorMessage) => {
        toast.error(errorMessage);
      });
  
      return Object.keys(validationErrors).length === 0;
    };
  
  //   // Submit handler for updating employee data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateFields()) return;

    const updatedData = {
      projectTitle,
      description,
      startDate,
      deadline,
      members,
      status,
    };

    try {
      const projectDocRef = doc(db, "projects", projectData.id);
      await updateDoc(projectDocRef, updatedData);
      toast.success("Project updated successfully!");
      navigate("/a-dashboard/a-projects");
      window.location.reload();
    } catch (error) {
      toast.error("Error updating employee: ");
      console.error("Error updating employee:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center ">
      <form
        className=" shadow rounded-lg w-[60%] px-5 mb-5"
        onSubmit={handleSubmit}
      >
        <div className="text-center font-semibold text-2xl  pb-[6px] pt-3">
          <h1>Edit Project Details Here</h1>
        </div>
        <div className="py-[4%]">
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="">
              Project Title :
            </label>
            <CustomInputField
              type="text"
              name="projectTitle"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Project Title"
            />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <label htmlFor="description">Project Description :</label>
            <ReactQuill
              id="description"
              theme="snow"
              className="h-20"
              value={description}
              onChange={setDescription}
              placeholder="Write the Project Description here..."
            />
          </div>
          <div className="flex flex-wrap justify-between mt-[60px]">
            <div className="mt-3 flex justify-between items-center">
              <label htmlFor="startDate" className="w-[140px]">
                Start Date :
              </label>
              <CustomInputField
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="mt-3 flex justify-between items-center">
              <label htmlFor="deadline" className="w-[140px]">
                Deadline :
              </label>
              <CustomInputField
                type="date"
                name="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center mt-3">
            <label htmlFor="members" className="w-[140px]">
              Select Members :
            </label>
            <MultipleSelectChip value={members} onChange={setMembers} />
          </div>
          <div className="flex flex-wrap items-center mt-3">
            <label htmlFor="status" className="w-[140px]">
              Status :
            </label>
            <select
              name="status"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-2 py-1"
            >
              <option value="active">Active</option>
              <option value="onhold">Onhold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-5 mt-5 justify-center">
            {loading ? (
              <p className="bg-primary rounded text-white px-[35px] py-2">
                Loading...
              </p>):(
            <button className="bg-primary rounded text-white px-[35px] py-2" type="submit">
              Update
            </button>
            )}
            <button
              className="bg-primary rounded text-white px-[35px] py-2"
              type="button"
              onClick={() => navigate("/a-dashboard/a-projects")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
