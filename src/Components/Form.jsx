import React, { useState,useEffect } from "react";
import { collection, addDoc, getDocs} from 'firebase/firestore';
import {db,secondaryAuth,storage} from "../Firebase/FirebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth";
import {ref,uploadBytes,getDownloadURL} from "firebase/storage"
import { useNavigate } from "react-router-dom";


export default function Form() {
  const [regId, setRegId] = useState('');
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCNIC] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('Active');
  const [created_at, setCreatedAt] = useState('');
  const [error, setError] =useState('')
  const navigate = useNavigate();
  const [loading,setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    setErrors(validationErrors);
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
      await addDoc(collection(db, 'users'), {regId,fullName,fatherName,cnic,email,dateOfJoining,status,created_at: formattedDate,role:"employee"});

      alert('Data saved successfully!');
      setFullName("");
      setRegId("");
      setFatherName("");
      setCNIC("");
      setEmail("");
      setDateOfJoining("");
      setStatus("");
      setCreatedAt("");
      setPassword("");
      setConfirmPassword("");
      
      navigate("/a-dashboard/employees");
      

    } catch (error) {
      console.error('Error adding document: ', error);
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
        <h1>Enter Your Details Here</h1>
      </div>
      <div className="py-[4%]">
        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="" className=" ">Reg-ID :</label>
            <input
              type="text"
              className="border-[2px] rounded p-[10px] w-full"
              value={regId}
              readOnly
            />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Full Name :</label>
            <input
              type="text"
              className="border-[2px] rounded p-[10px] w-full"
              value={fullName}
              placeholder="Full Name"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {errors.fullName && <div className="text-red-600">{errors.fullName}</div>}
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Father Name :</label>
            <input
              type="text"
              className="border-[2px] rounded p-[10px] w-full"
              value={fatherName}
              placeholder="Father Name"
              onChange={(e) => setFatherName(e.target.value)}
              required
            />
            {errors.fatherName && <div className="text-red-600">{errors.fatherName}</div>}
          </div>
          <div className="w-[50%]">
            <label htmlFor="">CNIC :</label>
            <input
              type="number"
              className="border-[2px] rounded p-[10px] w-full"
              value={cnic}
              placeholder="CNIC"
              onChange={(e) => setCNIC(e.target.value)}
              required
            />
            {errors.cnic && <div className="text-red-600">{errors.cnic}</div>}
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Email :</label>
            <input
              type="email"
              className="border-[2px] rounded p-[10px] w-full"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <div className="text-red-600">{errors.email}</div>}
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Date of Joining :</label>
            <input
              type="date"
              className="border-[2px] rounded p-[10px] w-full"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-[10px]">
        <div className="w-[50%]">
            <label htmlFor="">Password :</label>
            <input
              type="password"
              className="border-[2px] rounded p-[10px] w-full"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errors.password && <div className="text-red-600">{errors.password}</div>}

          <div className="w-[50%]">
            <label htmlFor="">Confirm Password :</label>
            <input
              type="password"
              className="border-[2px] rounded p-[10px] w-full"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <div className="text-red-600">{errors.confirmPassword}</div>}
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
            <span>Loading...</span>
          </button>
        </div>
        ):(
        <div className="flex justify-center">
          <button
            className="bg-black rounded text-white px-[30px] py-2"
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
