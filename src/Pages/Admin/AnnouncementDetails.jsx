import React, { useState, useEffect,useRef,useContext } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import CustomInputField from "../../Components/CustomInputField";
import { AuthContext } from "../../hooks/AuthContext";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'; 
export default function AnnouncementDetails() {
  const [announcement, setAnnouncement] = useState(null);
  const {allData} = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const announcementRef = doc(db, "announcements", id);
        const docSnapshot = await getDoc(announcementRef);

        if (docSnapshot.exists()) {
          setAnnouncement(docSnapshot.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleClose = () => {
    if (allData.role === "admin"){
      window.location.href = "/a-dashboard/announcements";
    }
    if (allData.role === "employee"){
      window.location.href = "/dashboard/announcements";
    }
  };

  return (
    <div className="m-6 w-[70%] mt-10">
      {loading ? (
        <p>Loading announcement...</p>
      ) : announcement ? (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Announcement Details</h1>
          <div className="flex justify-between">
          <div className="mb-4 w-[40%]">
            <label className="block text-lg font-semibold mb-2">Title</label>
            <input
              type="text"
              value={announcement.title}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
            />
          </div>

          <div className="mb-4 w-[30%]">
            <label className="block text-lg font-semibold mb-2">Date :</label>
            <input
              type="text"
              value={formatDate(announcement.createdAt)}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
            />
          </div>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">Description</label>
            <ReactQuill
              value={announcement.description}
              theme="snow"
              readOnly
              className="h-40 bg-gray-100"
            />
          </div>

          <div className="mt-16">
            <button onClick={() => {handleClose()}} className="bg-primary text-white px-4 py-1 rounded">Close</button>
            </div>
        </div>
      ) : (
        <p>No announcement found.</p>
      )}
    </div>
  );
}