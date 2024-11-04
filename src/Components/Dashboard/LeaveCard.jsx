import React from "react";

export default function LeaveCard() {
    const leaves = [
        {id:1,name: "Muhammad Ali", date: "13 Oct 2024" },
        {id:2, name: "Ahmad Ali", date: "5 Sep 2024" },
        {id:3,name: "Ahsan Ijaz", date: "7 August 20124" },
      ];
  return (
    <div className=" mx-auto my-8 ">
      <div className=" py-2 px-4 shadow w-full  text-2xl font-semibold">
        Employees On Leave
      </div>
      <table className="w-full shadow">
        <thead className="shadow">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}className="border-b">
              <td className="py-2 px-4">{leave.name}</td>
              <td className="py-2 px-4">{leave.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
