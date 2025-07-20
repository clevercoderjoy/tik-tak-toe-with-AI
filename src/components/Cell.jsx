import React from 'react';

const Cell = ({ value, onClick }) => {
  const getValueStyle = () => {
    if (value === 'X') return 'text-red-500';
    if (value === 'O') return 'text-blue-500';
    return 'text-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className="h-24 w-24 sm:h-20 sm:w-20 rounded-xl border-2 border-gray-300 flex items-center justify-center text-5xl sm:text-4xl font-extrabold cursor-pointer hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
    >
      <span className={getValueStyle()}>{value}</span>
    </div>
  );
};

export default Cell;
