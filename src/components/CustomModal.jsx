import Portal from './Portal'

const CustomModal = ({ title, buttons, scores }) => {
  return (
    <Portal>
      <h2 className="text-xl text-center font-bold">{typeof title === "function" ? title() : title}</h2>
      {scores && (
        <div className="mt-4 text-center flex items-center justify-center gap-8 font-bold">
          <p className="text-lg">You: {scores.player1}</p>
          <p className="text-lg">AI: {scores.player2}</p>
        </div>
      )}
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