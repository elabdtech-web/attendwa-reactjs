import React, { useState,useEffect } from "react";
import { collection, addDoc, getDocs,serverTimestamp} from 'firebase/firestore';
import {db,secondaryAuth,storage} from "../../Firebase/FirebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth";
import {ref,uploadBytes,getDownloadURL} from "firebase/storage"
import { useNavigate } from "react-router-dom";
import CustomInputField from "../../Components/CustomInputField";
import {toast} from "react-toastify";

export default function FormPage() {
  const [regId, setRegId] = useState('');
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCNIC] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('active');
  const [created_at, setCreatedAt] = useState('');
  const navigate = useNavigate();
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    const fetchNextRegId = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const regIds = snapshot.docs.map(doc => doc.data().regId).filter(Boolean); 

      const nextRegIdNumber = regIds.reduce((max, id) => {
        const number = parseInt(id.split('-')[1], 10);
        return number > max ? number : max;
      }, 0) + 1;
      
      const newRegId = `EMP-${String(nextRegIdNumber).padStart(3, '0')}`; 
      setRegId(newRegId);
    };

    fetchNextRegId();
  }, []);

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
    if (password.length < 6) {
      validationErrors.password = "Password should be at least 6 characters long";
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (!dateOfJoining) {
      validationErrors.dateOfJoining = "Date of joining is required";
    }

    if (!phone.match(/^\d{11}$/)) {
      validationErrors.phone = "Phone number should be 11 digits";
    }
    
    if (!jobTitle) {
      validationErrors.jobTitle = "Job title is required";
    }
    if (!address.trim()) {
      validationErrors.address = "Address is required";
    }

    Object.values(validationErrors).forEach(errorMessage => {
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
    const formattedDate = new Date().toISOString(); 
 
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;
      await addDoc(collection(db, 'users'), {regId,fullName,fatherName,cnic,phone,email,address,dateOfJoining,jobTitle,status,created_at: serverTimestamp(),role:"employee"});

      toast.success('Employee Created successfully!');
      setFullName("");
      setRegId("");
      setFatherName("");
      setCNIC("");
      setEmail("");
      setPhone("");
      setAddress("");
      setDateOfJoining("");
      setStatus("");
      setJobTitle("");
      setCreatedAt("");
      setPassword("");
      setConfirmPassword("");
      
      navigate("/a-dashboard/employees");
      

    } catch (error) {
      toast.error('Error adding document: ', error);
    }
    setLoading(false);
  
  };
  return ( 
    <div className="flex justify-center ">
      <form
        className=" shadow rounded-lg w-[70%] px-5"
        onSubmit={handleSubmit}
      >
      <div className="text-center font-semibold text-2xl  pb-[6px] pt-3">
        <h1>Enter Employee Details Here</h1>
      </div>
      <div className="py-[4%]">
        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="" className=" ">Reg-ID :</label>
            <CustomInputField type="text" name="regId" value={regId} readOnly/> 
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Full Name :</label>
            <CustomInputField type="text" name="fullName" value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Full Name" required />
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Father Name :</label>
            <CustomInputField type="text" name="fatherName" value={fatherName} onChange={(e)=>setFatherName(e.target.value)} placeholder="Father Name" required />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">CNIC :   <span className="text-gray-600">(13 Digits without dashes)</span></label>
            <CustomInputField type="number" name="cnic" value={cnic} onChange={(e)=>setCNIC(e.target.value)} placeholder="CNIC" required />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Email :</label>
            <CustomInputField type="email" name="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Phone : <span className="text-gray-600">(03xxxxxxxxx)</span></label>
            <CustomInputField type="number" name="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" required />
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
                required
              />
            </div>
            <div className="w-[35%]">
                <label htmlFor="">Job Title :</label>
                <CustomInputField type="text" name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job Title" required/>
            </div>
            <div className="w-[25%]">
              <label htmlFor="">Date of Joining :</label>
              <CustomInputField
                type="date"
                name="dateOfJoining"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                required
              />
            </div>
          </div>

        <div className="flex justify-center gap-4 mb-[10px]">
        <div className="w-[50%]">
            <label htmlFor="">Password :</label>
            <CustomInputField type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required />
            </div>

          <div className="w-[50%]">
            <label htmlFor="">Confirm Password :</label>
            <CustomInputField type="password" name="confirmPassword" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
            </div>
        </div>

        <div className="flex justify-center gap-4 mb-[35px] ">
        </div>

        {loading ? (
          <div className="flex justify-center">
          <button
            className="bg-black rounded text-white px-[30px] py-2"
            type="submit"
          >
            Loading...
          </button>
        </div>
        ):(
        <div className="flex justify-center">
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