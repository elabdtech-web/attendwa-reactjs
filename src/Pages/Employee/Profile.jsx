// import React, { useState, useEffect } from 'react';
// import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
// import { collection,doc, getDocs } from 'firebase/firestore';
// import { db } from '../../Firebase/FirebaseConfig';
// import {useUserContext} from "../../hooks/HeadertextContext"

// export default function Profile() {
//   const {setHeaderText} =useUserContext(); 
//   const [userData, setUserData] = useState(null);
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const auth = getAuth();

//   const fetchProfileData = async () => {
//     try {
//         const employeeCollection = collection(db,"users");
//         const employeeQuery = query(employeeCollection, where ("role","==","employee"));
//         const employeeSnapshot = await getDocs(employeeQuery);

//     }
//   }

  






//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     if (newPassword !== confirmNewPassword) {
//         setError("New passwords do not match");
//         return;
//     }
//     try{
//         const user = auth.currentUser;
//         const credential = EmailAuthProvider.credential(user.email,oldPassword);
//         await reauthenticateWithCredential(user,credential);
//         await updatePassword(user,newPassword);
//         setSuccess("Password updated successfully");
//     }catch (err){
//         setError("Failed to update password.please check the old password.");
//     }
//   };

//   useEffect(()=>{
//     setHeaderText("Profile");
//   })
  

//   return (
//     <div className="profile-container">
//       {/* <div className="info-box">
//         <h2>User Information</h2>
//         {userData ? (
//           <>
//             <p><strong>Reg No:</strong> {userData.regId}</p>
//             <p><strong>Email:</strong> {userData.email}</p>
//             <p><strong>Name:</strong> {userData.name}</p>
//             <p><strong>CNIC:</strong> {userData.cnic}</p>
//             <img src={userData.image} alt="User" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
//           </>
//         ) : (
//           <p>Loading user data...</p>
//         )}
//       </div> */}
//       <div>
//         <h1>User Information</h1>
//         {userData ? (
//             <div>
//                 <p>Reg No:</p>
//                 <p>Email:</p>
//                 <p>Name:</p>
//                 <p>CNIC:</p>
//                 <img src="" alt="" />
//             </div>
//         ):(
//             <p>Loading User Data...</p>
//         )}
//       </div>

//       <div className="password-box">
//         <h2>Change Password</h2>
//         <form onSubmit={handlePasswordChange}>
//           <div>
//             <label>Old Password:</label>
//             <input
//               type="password"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>New Password:</label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Confirm New Password:</label>
//             <input
//               type="password"
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit">Update Password</button>
//         </form>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         {success && <p style={{ color: 'green' }}>{success}</p>}
//       </div>
//     </div>
//   );
// }


import React from 'react'

export default function Profile() {
  return (
    <div>
      jksndajk
    </div>
  )
}
