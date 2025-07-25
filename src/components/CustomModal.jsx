import Portal from './Portal'

const CustomModal = ({ title, buttons, scores }) => {
  return (
    <Portal>
      <div className="rounded-2xl bg-[#181c2f]/95 border-8 border-[#ff4ecd] shadow-[0_0_32px_4px_#ff4ecd55] p-4 max-w-md mx-auto">
        <h2 className="text-3xl text-center font-extrabold text-[#ff4ecd] drop-shadow-lg mb-4 tracking-wider uppercase">
          {typeof title === "function" ? title() : title}
        </h2>
        {scores && (
          <div className="mt-4 text-center flex items-center justify-center gap-8 font-bold">
            <p className="text-lg text-[#ff4ecd]">You: {scores.player1}</p>
            <p className="text-lg text-[#00fff7]">AI: {scores.player2}</p>
          </div>
        )}
        <div className="buttons flex items-center justify-evenly mt-8 gap-4">
          {buttons.map((btn, index) => (
            <button
              key={index}
              className={btn.className}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </Portal>
  )
}

export default CustomModal