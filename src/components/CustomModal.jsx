import React from 'react'
import Portal from './Portal'

const CustomModal = ({ title, buttons }) => {
  return (
    <Portal>
      <h2 className="text-xl text-center font-bold">{title}</h2>
      <div className="buttons flex items-center justify-evenly mt-8">
        {buttons.map((btn, index) => (
          <button
            key={index}
            className={`${btn.className || ""}`}
            onClick={btn.onClick}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </Portal>
  )
}

export default CustomModal