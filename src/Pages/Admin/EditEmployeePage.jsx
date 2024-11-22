import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../Firebase/FirebaseConfig";
import { toast } from "react-toastify";
import CustomInputField from "../../Components/CustomInputField";
import { useParams, useNavigate } from "react-router-dom";

export default function EditEmployee() {
  const [regId, setRegId] = useState("");
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [cnic, setCNIC] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [status, setStatus] = useState("active");
  const [employeeData, setEmployeeData] = useState(null);
  const { id } = useParams(); 
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      fetchEmployeeData(id);
    }
  }, [id]);

  const fetchEmployeeData = async (regId) => {
    try {
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("regId", "==", regId));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        setEmployeeData({ id: userDoc.id, ...userData });
      } else {
        toast.error("Employee not found!");
        setEmployeeData(null);
      }
    } catch (error) {
      toast.error("Error fetching employee data");
    }
  };

  useEffect(() => {
    if (employeeData) {
      setRegId(employeeData.regId || "");
      setFullName(employeeData.fullName || "");
      setFatherName(employeeData.fatherName || "");
      setCNIC(employeeData.cnic || "");
      setEmail(employeeData.email || "");
      setPhone(employeeData.phone || "");
      setAddress(employeeData.address || "");
      setJobTitle(employeeData.jobTitle || "");
      setDateOfJoining(employeeData.dateOfJoining || "");
      setStatus(employeeData.status || "active");
    }
  }, [employeeData]);

  // Form validation
  const validateFields = () => {
    let validationErrors = {};

    if (!fullName.trim()) {
      validationErrors.fullName = "Full name is required";
    }
    if (!fatherName.trim()) {
      validationErrors.fatherName = "Father name is required";
    }
    if (!cnic.match(/^\d{13}$/)) {
      validationErrors.cnic = "CNIC should be a 13-digit number";
    }
    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      validationErrors.email = "Enter a valid email address";
    }
    if (!dateOfJoining) {
      validationErrors.dateOfJoining = "Date of joining is required";
    }
    if (!phone.match(/^\d{11}$/)) {
      validationErrors.phone = "Phone number should be 11 digits";
    }
    if (!address.trim()) {
      validationErrors.address = "Address is required";
    }
    if (!jobTitle.trim()) {
      validationErrors.jobTitle = "Job title is required";
    }

    Object.values(validationErrors).forEach((errorMessage) => {
      toast.error(errorMessage);
    });

    return Object.keys(validationErrors).length === 0;
  };

  // Submit handler for updating employee data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    if (!employeeData || !employeeData.id) {
      toast.error("No employee data to update");
      return;
    }

    const updatedData = {
      regId,
      fullName,
      fatherName,
      cnic,
      email,
      phone,
      address,
      jobTitle,
      dateOfJoining,
      status,
    };

    try {
      const employeeDocRef = doc(db, "users", employeeData.id);
      await updateDoc(employeeDocRef, updatedData);
      toast.success("Employee updated successfully!");
      navigate("/a-dashboard/employees");
    } catch (error) {
      toast.error("Error updating employee: " + error.message);
    }
  };

  return (
    <div className="flex justify-center">
      <form className="shadow rounded-lg w-[70%] px-5" onSubmit={handleSubmit}>
        <div className="text-center font-semibold text-2xl pb-[6px] pt-3">
          <h1>Update Employee Details Here</h1>
        </div>
        <div className="py-[4%]">
          <div className="flex justify-center gap-4 mb-[35px]">
            <div className="w-[50%]">
              <label htmlFor="">Reg-ID :</label>
              <CustomInputField type="text" name="regId" value={regId} readOnly />
            </div>
            <div className="w-[50%]">
              <label htmlFor="">Full Name :</label>
              <CustomInputField
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-[35px]">
            <div className="w-[50%]">
              <label htmlFor="">Father Name :</label>
              <CustomInputField
                type="text"
                name="fatherName"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father Name"
              />
            </div>
            <div className="w-[50%]">
              <label htmlFor="">CNIC :</label>
              <CustomInputField
                type="text"
                name="cnic"
                value={cnic}
                onChange={(e) => setCNIC(e.target.value)}
                placeholder="CNIC"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-[35px]">
            <div className="w-[50%]">
              <label htmlFor="">Email :</label>
              <CustomInputField
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="w-[50%]">
              <label htmlFor="">Phone :</label>
              <CustomInputField
                type="text"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-[35px]">
            <div className="w-[40%]">
              <label htmlFor="">Address :</label>
              <CustomInputField
                type="text"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="w-[35%]">
                <label htmlFor="">Job Title :</label>
                <CustomInputField type="text" name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job Title"/>
            </div>
            <div className="w-[25%]">
              <label htmlFor="">Date of Joining :</label>
              <CustomInputField
                type="date"
                name="dateOfJoining"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-5">
            <button className="bg-primary rounded text-white px-[35px] py-2" type="submit">
              Update
            </button>
            <button
              className="bg-primary rounded text-white px-[35px] py-2"
              type="button"
              onClick={() => navigate("/a-dashboard/employees")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
