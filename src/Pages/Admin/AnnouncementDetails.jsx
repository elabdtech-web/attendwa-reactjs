import React, { useState, useEffect, useRef, useContext } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import CustomInputField from "../../Components/CustomInputField";
import { AuthContext } from "../../hooks/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
export default function AnnouncementDetails() {
  const [announcement, setAnnouncement] = useState(null);
  const { allData } = useContext(AuthContext);
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
    if (allData.role === "admin") {
      window.location.href = "/a-dashboard/announcements";
    }
    if (allData.role === "employee") {
      window.location.href = "/dashboard/announcements";
    }
  };

  return (
    <div className="base:m-6 m-auto base:w-[75%] w-[95%] mt-10">
      {loading ? (
        <p>Loading announcement...</p>
      ) : announcement ? (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Announcement Details</h1>
          <div className="flex gap-2 items-center justify-end mb-4">
            <label className="block text-lg font-semibold">Date :</label>
            <p className="text-base">{formatDate(announcement.createdAt)}</p>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <label className="block text-xl font-semibold">Title :</label>
            <p className="text-lg">{announcement.title}</p>
          </div>

          <div className="gap-2">
            <label className="block text-lg font-semibold">
              Description :
            </label>
            <p
              className="text-html"
              dangerouslySetInnerHTML={{ __html: announcement.description }}
            />
          </div>

          <div className="mt-5">
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
      ) : (
        <p>No announcement found.</p>
      )}
    </div>
  );
}
