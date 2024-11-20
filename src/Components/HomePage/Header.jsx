import React, { useState, useEffect } from "react";
import { auth } from "../../Firebase/FirebaseConfig";
import Button from "./Button";
import { Link } from "react-router-dom";

export default function Header() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAccessToken(user.uid);  // Set accessToken to user's UID when user is authenticated
      } else {
        setAccessToken(null);  // Set accessToken to null when there is no user
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex justify-between items-center px-[5%] bg-gray-600 h-[10vh]">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="size-14" />
        <h1 className="font-semibold text-[20px] text-white">ELABD TECH</h1>
      </div>
      <div>
        {accessToken ? (
          <Link to="/dashboard">
            <Button text={"Dashboard"} />
          </Link>
        ) : (
          <Link to="/login">
            <Button text={"Login"} />
          </Link>
        )}
      </div>
    </div>
  );
}
