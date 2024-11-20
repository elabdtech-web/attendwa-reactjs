import React, { useState, useEffect } from "react";
import {auth} from "../../Firebase/FirebaseConfig"
import Button from "./Button";
import { Link } from "react-router-dom";

export default function Header() {
  const [accessToken, setAccessToken] = useState(null);
    if (auth.currentUser) {
      setAccessToken(auth.currentUser.uid);
    } else {
      setAccessToken(null);
    }
  return (
    <div className="flex justify-between items-center px-[5%] bg-gray-600 h-[10vh]">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="size-14" />
        <h1 className="font-semibold text-[20px] text-white">ELABD TECH</h1>
      </div>
      <div>
        {accessToken  ? (
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