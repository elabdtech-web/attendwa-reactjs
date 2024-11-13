import React from "react";

const CustomInputField = ({ type, placeholder, name, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full py-2 px-3 bg-white border rounded-md shadow-sm focus:outline-none focus:border-primary"
    />
  );
};

export default CustomInputField;
