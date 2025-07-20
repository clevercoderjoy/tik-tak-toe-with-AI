import { useEffect, useRef, useState } from 'react';
import { FaRegCircle, FaRegTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Board from './components/Board';
import './App.css';
import CustomModal from './components/CustomModal';

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [game, setGame] = useState(1);
  const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
  const [playerNames] = useState({ player1: "You", player2: "AI" });
  const [playerChoice, setPlayerChoice] = useState({ player1: null, player2: null });
  const gameEndedRef = useRef(false);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "",
    title: "",
    buttons: []
  })

  const openModal = (type) => {
    switch (type) {
      case "playerChoice":
        setModalConfig({
          show: true,
          type,
          title: "Who goes first?",
          buttons: [
            {
              label: <FaRegCircle size={24} />,
              onClick: () => handlePlayerSelection("O"),
              className: "flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-800 rounded-lg font-bold text-black hover:bg-black hover:text-white transition-all"
            },
            {
              label: <FaRegTimesCircle size={24} />,
              onClick: () => handlePlayerSelection("X"),
              className: "flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-800 rounded-lg font-bold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
      case "resetGame":
        setModalConfig({
          show: true,
          type,
          title: "Do you want to reset the game?",
          buttons: [
            {
              label: "Yes",
              onClick: handleResetConfirm,
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            },
            {
              label: "No",
              onClick: () => setModalConfig({ ...modalConfig, show: false }),
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
      case "gameOver":
        setModalConfig({
          show: true,
          type,
          title: "Game Over! Play Again?",
          buttons: [
            {
              label: "Yes",
              onClick: handlePlayAgainConfirm,
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            },
            {
              label: "No",
              onClick: handlePlayAgainCancel,
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
      case "showScores":
        setModalConfig({
          show: true,
          type,
          title: getFinalScores(),
          buttons: [
            {
              label: "New Game",
              onClick: handleNewGameClick,
              className: "px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
            }
          ]
        });
        break;
    }
  }

  const whoGoesFirst = () => {
    openModal("playerChoice");
  };

  const handlePlayerSelection = (choice) => {
    setCurrentPlayer(choice);
    setPlayerChoice({ player1: choice, player2: choice === "X" ? "O" : "X" });
    setModalConfig({ ...modalConfig, show: false });
  };

  const handleCellClick = (index) => {
    if (board[index] === null) {
      const updatedBoard = [...board];
      updatedBoard[index] = currentPlayer;
      setBoard(updatedBoard);
      switchTurns();
    } else {
      toast.error("Cell taken!");
    }
  };

  const switchTurns = () => {
    setCurrentPlayer(prev => (prev === "X" ? "O" : "X"));
  };

  const checkWin = (boardState) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a];
      }
    }
    return null;
  }

  const checkDraw = (boardState) => {
    return !boardState.includes(null)
  }

  const resetGame = () => {
    openModal("resetGame");
  };

  const resetEverything = () => {
    setPlayerScores({ player1: 0, player2: 0 });
    setGame(1);
    setBoard(Array(9).fill(null));
    setPlayerChoice({ player1: null, player2: null });
    setCurrentPlayer(null);
    setModalConfig({ ...modalConfig, show: false });
    openModal("playerChoice");
  };

  const handleResetConfirm = () => {
    resetEverything();
  };

  const handlePlayAgainCancel = () => {
    setModalConfig({ ...modalConfig, show: false });
    openModal("showScores");
  }

  const handlePlayAgainConfirm = () => {
    setBoard(Array(9).fill(null));
    setPlayerChoice({ player1: null, player2: null });
    setCurrentPlayer(null);
    setModalConfig({ ...modalConfig, show: false });
    setGame(game => game + 1);
    openModal("playerChoice");
  }

  const handleNewGameClick = () => {
    resetEverything();
  }

  const getFinalScores = () => {
    return (
      <>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold">Score Board</h2>
          <p className="text-lg">{playerNames.player1}: {playerScores.player1}</p>
          <p className="text-lg">{playerNames.player2}: {playerScores.player2}</p>
        </div>
      </>
    )
  }

  useEffect(() => {
    whoGoesFirst();
  }, []);

  useEffect(() => {
    const winner = checkWin(board);
    const isDraw = checkDraw(board);

    if ((winner || isDraw) && currentPlayer && !gameEndedRef.current) {
      gameEndedRef.current = true;

      if (winner) {
        let winningPlayer;
        if (winner === playerChoice.player1) {
          winningPlayer = "player1";
        } else {
          winningPlayer = "player2";
        }

        setPlayerScores(prevScores => {
          const newScores = { ...prevScores };
          newScores[winningPlayer] += 1;
          return newScores;
        });

        toast.success(`${winner} wins!`);
        openModal("gameOver");
      } else {
        toast.success("It's a draw!");
        openModal("gameOver");
      }
    }
  }, [board]);

  useEffect(() => {
    gameEndedRef.current = false;
  }, [game]);

  useEffect(() => {
    if (modalConfig.show && modalConfig.type === "showScores") {
      setModalConfig(prev => ({
        ...prev,
        title: getFinalScores()
      }));
    }
  }, [playerScores, modalConfig.show, modalConfig.type]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <h1 className="text-[tomato] text-center font-extrabold text-5xl mb-10 mt-6 drop-shadow-sm">
        Tik-Tak-Toe With AI
      </h1>

      <h2 className='text-[tomato] text-center font-extrabold text-3xl mb-10 mt-6 drop-shadow-sm'>Game: {game}</h2>

      <Board board={board} onCellClick={handleCellClick} />

      {
        modalConfig.show && (
          <CustomModal
            title={modalConfig.title}
            buttons={modalConfig.buttons}
          />
        )
      }

      <div className="text-center mt-10">
        <button
          onClick={resetGame}
          className="px-6 py-2 text-lg font-bold bg-black text-white rounded-lg border-2 border-black hover:bg-[tomato] hover:border-[tomato] transition-all"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;