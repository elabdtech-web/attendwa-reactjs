import React from "react";
import { FaUser } from "react-icons/fa";

export default function Details({ title, description }) {
  return (
    <div>
      <div className=" bg-white p-5 rounded-xl flex justify-between">
        <div>
          <h1 className="font-semibold">{title}</h1>
          <p className="font-normal text-[20px]">{description}</p>
        </div>
        <div className="my-auto">
          <FaUser size={30} className="text-blue-500"/>
        </div>
      </div>
    </div>
  );
}
