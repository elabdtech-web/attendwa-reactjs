import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import CustomInputField from "../../Components/CustomInputField";
import { toast } from "react-toastify";
import MultipleSelectChip from "../../Components/MultiSelect";

export default function ProjectForm() {
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "projects"), {
        projectTitle,
        description,
        startDate,
        deadline,
        members,
        status,
        created_at: serverTimestamp(),
      });
      setLoading(false);
      navigate("/a-dashboard/a-projects");
      setProjectTitle("");
      setDescription("");
      setStartDate("");
      setDeadline("");
      setMembers([]);
      setStatus("active");
      toast.success("Project added successfully!");
    } catch (error) {
      toast.error("Error adding project: ");
      console.error("Error adding project:", error);
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
          <h1>Enter Project Details Here</h1>
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
                onChange={(e) => 
                  setStartDate(e.target.value)}
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
            <MultipleSelectChip onChange={setMembers} />
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

          {loading ? (
            <div className="flex justify-center mt-6">
              <button
                className="bg-primary rounded text-white px-[30px] py-2"
                type="submit"
              >
                Loading...
              </button>
            </div>
          ) : (
            <div className="flex justify-center mt-6">
              <button
                className="bg-primary rounded text-white px-[30px] py-2"
                type="submit"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
