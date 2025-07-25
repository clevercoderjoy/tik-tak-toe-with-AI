import React from 'react';
import Cell from './Cell';

const Board = ({ board, onCellClick }) => {
  return (
    <div className="flex justify-center items-center mt-6">
      <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl border-4 border-[#00fff7] bg-[#232946]/90 shadow-2xl">
        {board.map((value, index) => (
          <Cell key={index} value={value} onClick={() => onCellClick(index)} />
        ))}
      </div>
    </div>
  );
};

export default Board;
