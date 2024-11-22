import React, { useState,useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for the text editor
import CustomInputField from "../../Components/CustomInputField";
import { db } from "../../Firebase/FirebaseConfig"; // Firebase config
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore"; 
import {useLocation} from "react-router-dom"
import { toast } from "react-toastify";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";

export default function AddNewAnnouncement() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    if(location.pathname !== "/a-dashboard/announcements/addNewAnnouncement"){
      navigate("/dashboard")
    }
  })
  

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.warning("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      // Add the announcement to Firebase
      await addDoc(collection(db, "announcements"), {
        title,
        description,
        createdAt: Timestamp.now(), // Store the current timestamp in UTC
      });

      setTitle("");
      setDescription("");
      toast.success("Announcement added successfully!");

      // Fetch active employees and send emails
      sendEmailNotifications();
      setLoading(false);
    } catch (error) {
      toast.error("Error adding announcement.");
    }
  };
  const sendEmailNotifications = async () => {
    try {
      const q = query(collection(db, "users"), where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
  
      const emailList = [];
      querySnapshot.forEach((doc) => {
        emailList.push(doc.data().email);
      });
  
      if (emailList.length === 0) {
        toast.info("No active employees to notify.");
        return;
      }
  
      // Loop through email list and send email to each recipient
      for (const email of emailList) {
        const templateParams = {
          to_email: email, // Pass recipient email dynamically
        from_name:"Elabd Tech", // Ensure title is defined in your component
         message: description, // Ensure description is defined in your component
        };
  
        try {
          await emailjs.send(
            "service_lhnotzd", // Your EmailJS Service ID
            "template_5im90xe", // Your EmailJS Template ID
            templateParams,
            "f7Wu4pE1pLAeAua39" // Your EmailJS Public Key
          );
          toast.success(`Email sent to ${email}`);
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          toast.error(`Failed to send email to ${email}: ${error.text}`);
        }
      }
  
      toast.success("All email notifications sent successfully!");
    } catch (error) {
      console.error("Error sending email notifications:", error);
      toast.error("Error sending email notifications.");
    }
  };
  
  

  return (
    <div className="m-6 w-[70%] mt-10">
      <h1 className="text-2xl font-semibold mb-6">Add New Announcement</h1>
      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2" htmlFor="title">
          Title
        </label>
        <CustomInputField
          type="text" 
          placeholder="Enter title" 
          name="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          readOnly={false}
        />
      </div>
      <div className="mb-20">
        <label className="block text-lg font-semibold mb-2" htmlFor="description">
          Description
        </label>
        <ReactQuill
          id="description"
          className="h-40"
          theme="snow"
          value={description}
          onChange={setDescription}
          placeholder="Write the announcement here..."
        />
      </div>
      {loading ? (
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
          disabled
        >
          Loading...
        </button>
      ) : (
      <button
        className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
        onClick={handleSubmit}
      >
        Add Announcement
      </button>
      )}
    </div>
  );
}
