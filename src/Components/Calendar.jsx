import React from 'react';

const Calendar = ({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
  }) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 2020; i <= currentYear; i++) {
      years.push(i);
    }
  
    return (
      <div className="flex space-x-4">
        <select
          onChange={(e) => onMonthChange(e.target.value)}
          value={selectedMonth}
          className="border border-gray-300 rounded "
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
  
        <select
          onChange={(e) => onYearChange(e.target.value)}
          value={selectedYear}
          className="border border-gray-300 rounded"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  };

export default Calendar;  