import React from "react";

export default function EmployeeCard() {
 
  const employees = [
    {id:1, name: "Muhammad Ali", checkIn: "9:00 AM" },
    {id:2, name: "Abdullah", checkIn: "9:15 AM" },
    { id:3, name: "Ahsan Ijaz", checkIn: "8:45 AM" },
  ];
  return (
    <div className=" mx-auto mt-8">
      <div className=" py-2 px-4 bg-gray-200  w-full text-2xl font-semibold">
        Employees
      </div>
      <table className="w-full bg-white border border-gray-300">
        <thead className="">
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-left">Name</th>
            <th className="py-2 px-4 bg-gray-200 text-left">Check In</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b">
              <td className="py-2 px-4">{employee.name}</td>
              <td className="py-2 px-4">{employee.checkIn}</td>
           </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}