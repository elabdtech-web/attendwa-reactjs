import React, { useState,useEffect } from "react";
import { collection, addDoc, getDocs} from 'firebase/firestore';
import {db,auth,storage} from "../Firebase/FirebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth";
import {ref,uploadBytes,getDownloadURL} from "firebase/storage"


export default function Form() {
  const [regId, setRegId] = useState('');
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCNIC] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
   const [image, setImage] = useState('');
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('active');
  const [created_at, setCreatedAt] = useState('');
  const [error, setError] =useState('')
  const [formData,setFormData] =useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString(); 
    setFormData("null")
    if (password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }else{
      setError('')
    }

    console.log("Submitting data:", {
      regId,
      fullName,
      fatherName,
      cnic,
      email,
      password,
      confirmPassword,
      dateOfJoining,
      created_at: formattedDate,
      status
    });
  
    
    console.log("Image is ",image)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully:', user);
      const imageRef = ref(storage, `images/${image.name}`);

      await uploadBytes(imageRef, image); 
      const imageURL = await getDownloadURL(imageRef);
      console.log(imageURL)
      await addDoc(collection(db, 'users'), {
        regId,
        fullName,
        fatherName,
        cnic,
        email,
        dateOfJoining, 
        image: imageURL,
        status,
        created_at: formattedDate,
        role:"employee"
      });
      alert('Data saved successfully!');
      setFullName("");
      setRegId("");
      setFatherName("");
      setCNIC("");
      setEmail("");
      setDateOfJoining("");
      setImage("");
      setStatus("");
      setCreatedAt("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error('Error adding document: ', error);
    }
  
  };
  return ( 
    <div className="flex justify-center items-center ">
      <form
        className=" bg-gray-200 rounded-lg w-[70%] px-5"
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
              className="border-[2px] p-[10px] w-full"
              value={regId}
              readOnly
            />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Full Name :</label>
            <input
              type="text"
              className="border-[2px] p-[10px] w-full"
              value={fullName}
              placeholder="Full Name"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Father Name :</label>
            <input
              type="text"
              className="border-[2px] p-[10px] w-full"
              value={fatherName}
              placeholder="Father Name"
              onChange={(e) => setFatherName(e.target.value)}
              required
            />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">CNIC :</label>
            <input
              type="number"
              className="border-[2px] p-[10px] w-full"
              value={cnic}
              placeholder="CNIC"
              onChange={(e) => setCNIC(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-[35px]">
          <div className="w-[50%]">
            <label htmlFor="">Email :</label>
            <input
              type="email"
              className="border-[2px] p-[10px] w-full"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="w-[50%]">
            <label htmlFor="">Date of Joining :</label>
            <input
              type="date"
              className="border-[2px] p-[10px] w-full"
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
              className="border-[2px] p-[10px] w-full"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="w-[50%]">
            <label htmlFor="">Confirm Password :</label>
            <input
              type="password"
              className="border-[2px] p-[10px] w-full"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && (
          <div className="text-red-600 mb-[15px]">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-[35px] ">
          <div className="w-[50%]">
            <label htmlFor="">Upload Image :</label>
            <input
              type="file"
              className="border-[2px] p-[10px] w-full"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          <div className="w-[50%]">
            <label htmlFor="">Status</label>
            <select className="border-[2px] p-[10px] w-full">
              <option value="active">Active</option>
              <option value="In active">In Active</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="bg-blue-500 text-white px-[30px] py-2"
            type="submit"
          >
            Add
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
