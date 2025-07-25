import React from 'react';

const Cell = ({ value, onClick }) => {
  const getValueStyle = () => {
    if (value === 'X') return 'text-[#ff4ecd] drop-shadow-lg';
    if (value === 'O') return 'text-[#00fff7] drop-shadow-lg';
    return 'text-gray-200';
  };

  return (
    <div
      onClick={onClick}
      className="h-24 w-24 sm:h-20 sm:w-20 rounded-xl border-2 border-[#00fff7] flex items-center justify-center text-5xl sm:text-4xl font-extrabold cursor-pointer bg-[#181c2f]/80 hover:bg-[#00fff7]/20 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
    >
      <span className={getValueStyle()}>{value}</span>
    </div>
  );
};

export default Cell;
