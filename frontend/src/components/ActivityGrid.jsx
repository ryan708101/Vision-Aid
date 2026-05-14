import React from 'react';
import './ActivityGrid.css';
import { useSelector, useDispatch } from "react-redux";

const ActivityGrid = () => {
  const user = useSelector((state) => state.user);
  // Convert activityDates into a Set for quick lookup
  const activitySet = new Set(user.activityDates.map(({ date }) => date.split('T')[0]));

  // Helper function to get the number of days in a month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  // Generate grid data for each month
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const dates = Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const date = new Date(year, month, dayIndex+2); // Fix here: dayIndex should be dayIndex + 1
      const formattedDate = date.toISOString().split('T')[0];
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - 1);
      const formattedPrevDate = prevDate.toDateString();
      return {
        date,
        isActive: activitySet.has(formattedDate),
        tooltip: formattedPrevDate, // Tooltip for the previous day
      };
    });
    return { month, dates };
  });

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="monthly-grid-container mt-10 border border-white px-6 py-4 mx-6 rounded-2xl bg-gray-950" style={{boxShadow: '6px 6px 10px #0f0f0f'}}>
      {months.map(({ month, dates }) => (
        <div key={month} className="month-container">
          <h3 className="month-heading">{monthNames[month]}</h3>
          <div className="grid-container">
            {dates.map(({ date, isActive, tooltip }, index) => (
              <div
                key={index}
                className={`grid-cell ${isActive ? 'active' : ''}`}
                title={tooltip} // Tooltip for the previous day's date
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityGrid;
