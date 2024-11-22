import React, { useState, useEffect } from "react";
import { db } from "../../Firebase/FirebaseConfig";
import { collection, where, query, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { RiFileDownloadFill } from "react-icons/ri";

export default function SalaryCalculation() {
  const [employeeData, setEmployeeData] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      fetchEmployeeData(id);
    }
  }, [id]);

  const fetchEmployeeData = async (regId) => {
    try {
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("regId", "==", regId));

      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setEmployeeData(userData);
      }
      if (userSnapshot.empty) {
        setEmployeeData(null);
      }
    } catch (error) {
      toast.error("Error fetching employee data ");
    }
  };

  const handlePrint = () => {
    // Get the HTML content of the SalaryCalculation section
    const printContent = document.getElementById('salary-calculation').innerHTML;
  
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
  
    // Add the necessary HTML structure to the new window
    printWindow.document.write('<html><head><title>Salary Slip</title>');
    
    // Add styles from the current page (you can add more specific styles if needed)
    const styleSheets = document.styleSheets;
    let styles = '';
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        if (styleSheets[i].href) {
          // For external stylesheets
          styles += `@import url(${styleSheets[i].href});\n`;
        } else if (styleSheets[i].cssRules) {
          // For inline styles
          for (let j = 0; j < styleSheets[i].cssRules.length; j++) {
            styles += styleSheets[i].cssRules[j].cssText + '\n';
          }
        }
      } catch (e) {
        console.error('Error getting stylesheet rules:', e);
      }
    }
  
    printWindow.document.write('<style>' + styles + '</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="container" style="width: 100%; margin: 0 auto; padding: 10px;">' + printContent + '</div>');
    printWindow.document.write('</body></html>');
  
    // Wait for the content to load, then call the print method
    printWindow.document.close(); 
    printWindow.onload = () => {
      printWindow.print();
    };
  };
  
  

  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  const salaryMonth = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="relative w-[85%] "  id="salary-calculation">
      <div className=" p-6 m-6 max-w-4xl mx-auto">
        <div className="w-full flex justify-between border-b border-gray-300 items-center">
          <img src="/logo.png" alt="" className="w-[10%]" />
          <div className="text-center">
            <h2 className="pb-1 text-base font-semibold ">Salary Slip</h2>
            <div className="w-full h-[1.5px] bg-gradient-to-r from-[#b3dfc0] via-[#7afca3] to-[#b3dfc0]"></div>
            <p className="pt-1 pb-3 text-xs font-semibold text-gray-400">
              Elabd technologies Islamabad, pakistan
            </p>
          </div>
          <button onClick={handlePrint}><RiFileDownloadFill className="text-primary size-5"/></button>
          
        </div>
        {employeeData ? (
          <div className="py-[2%] text-lg flex gap-28">
            <div className="">
              <div className="flex items-center gap-2">
                <p className="font-medium ">Employee Name :</p>
                <p className="font-normal ">{employeeData.fullName}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium ">Post :</p>
                <p className="font-normal ">{employeeData.jobTitle}</p>
              </div>
            </div>
            <div className="">
              <div className="flex items-center gap-2">
                <p className="font-medium ">Date :</p>
                <p className="font-normal pl-1">{formattedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium ">Salary Month :</p>
                <p className="font-normal">{salaryMonth}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">Loading user data...</p>
        )}
      </div>

      {/*Salary Table*/}
      <div className="p-6">
      <div className="flex flex-col border border-gray-300 w-full">
        <div className="flex font-semibold ">
          <div className="border border-gray-300 px-4 py-2  flex-1">
            Salary
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            Deductions
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            
          </div>
        </div>
        <div className="flex">
          <div className="border border-gray-300 text-gray-400 px-4 py-2  flex-1">
            Basic Pay
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            30,000 Rs.
          </div>
          <div className="border border-gray-300 text-gray-400 px-4 py-2 flex-1">
            Absent (days)
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            05
          </div>
        </div>
        <div className="flex">
          <div className="border border-gray-300 text-gray-400 px-4 py-2  flex-1">
            Conveyance Allowance
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            30,000 Rs.
          </div>
          <div className="border border-gray-300 text-gray-400 px-4 py-2 flex-1">
            Absent deduction
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            3000 Rs.
          </div>
        </div>

        <div className="flex">
          <div className="border border-gray-300 text-gray-400 px-4 py-2  flex-1">
            Total Working Hours
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            176 hrs.
          </div>
          <div className="border border-gray-300 text-gray-400 px-4 py-2 flex-1">
            Tax rate
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            5.5%
          </div>
        </div>

        
        <div className="flex">
          <div className="border border-gray-300 text-gray-400 px-4 py-2  flex-1">
            Working Hours
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            150 hrs.
          </div>
          <div className="border border-gray-300 text-gray-400 px-4 py-2 flex-1">
            Tax amount
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            2000 Rs.
          </div>
        </div>

        
        <div className="flex">
          <div className="border border-gray-300 text-gray-400 px-4 py-2  flex-1">
            Pay per hour
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            200 Rs.
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            
          </div>
        </div>

        
        <div className="flex">
          <div className="border border-gray-300 px-4 py-5  flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-5 flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-5 flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-5 flex-1">
            
          </div>
        </div>

        <div className="flex">
          <div className="border border-gray-300 px-4 py-2  flex-1">
            Total earnings
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            30,000 Rs.
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            Total deductions
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            5000 Rs.
          </div>
        </div>

        
        <div className="flex">
          <div className="border border-gray-300 px-4 py-2  flex-1">
            
          </div>
          <div className="border border-gray-300 px-4 py-2 flex-1">
            
          </div>
          <div className="border border-gray-300 font-semibold text-primary px-4 py-2 flex-1">
            Net salary
          </div>
          <div className="border border-gray-300 font-semibold text-primary px-4 py-2 flex-1">
            25,000 Rs.
          </div>
        </div>
      </div>
    </div>

    </div>
  );
}
