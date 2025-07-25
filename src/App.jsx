import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Board from './components/Board';
import CustomModal from './components/CustomModal';
import { getAiMove } from './utils/ai';
import useLocalStorageWithReducer from "./hooks/useLocalStorageWithReducer";
import { gameReducer, initialState } from './reducers/gameReducer';
import './App.css';

function App() {

  const [state, dispatch] = useLocalStorageWithReducer("gameState", gameReducer, initialState);

  // Destructure state for easy access
  const {
    board,
    currentPlayer,
    round,
    playerScores,
    playerChoice,
    isAiTurn,
    modalConfig,
    scoreUpdated,
    showScores
  } = state;

  // Ref to track if the game has ended (prevents duplicate triggers for game over)
  const gameEndedRef = useRef(false);

  // --- Dispatchers for updating reducer state ---
  const setBoard = (payload) => dispatch({ type: "SET_BOARD", payload });
  const setCurrentPlayer = (payload) => dispatch({ type: "SET_CURRENT_PLAYER", payload });
  const setRound = (payload) => dispatch({ type: "SET_ROUND", payload });
  const setPlayerScores = (payload) => dispatch({ type: "SET_PLAYER_SCORES", payload });
  const setPlayerChoice = (payload) => dispatch({ type: "SET_PLAYER_CHOICE", payload });
  const setIsAiTurn = (payload) => dispatch({ type: "SET_IS_AI_TURN", payload });
  const setModalConfig = (payload) => dispatch({ type: "SET_MODAL_CONFIG", payload });
  const setShowScores = (payload) => dispatch({ type: "SET_SHOW_SCORES", payload });

  const openModal = (type) => {
    switch (type) {
      case "playerChoice":
        setModalConfig({
          show: true,
          type,
          title: "Who goes first?",
          buttons: [
            {
              label: "O",
              onClick: () => handlePlayerSelection("O"),
              className: "button-style"
            },
            {
              label: "X",
              onClick: () => handlePlayerSelection("X"),
              className: "button-style"
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
              className: "button-style"
            },
            {
              label: "No",
              onClick: () => setModalConfig({ ...modalConfig, show: false }),
              className: "button-style"
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
              className: "button-style"
            },
            {
              label: "No",
              onClick: () => {
                setModalConfig({ ...modalConfig, show: false });
                setTimeout(() => setShowScores(true), 100);
              },
              className: "button-style"
            }
          ]
        });
        break;
    }
  }

  const isAiTurnNow = () => {
    return currentPlayer && playerChoice.player2 === currentPlayer;
  }

  const whoGoesFirst = () => {
    openModal("playerChoice");
  };

  const handlePlayerSelection = (choice) => {
    setCurrentPlayer(choice);
    setPlayerChoice({ player1: choice, player2: choice === "X" ? "O" : "X" });
    setModalConfig({ ...modalConfig, show: false });
  };

  // runs only when it is human turn
  const handleCellClick = (idx) => {
    // Ignore clicks if it's AI's turn, game ended, or AI is thinking
    if (isAiTurnNow() || gameEndedRef.current || isAiTurn) return;
    if (board[idx] === null) {
      // Place current player's symbol in the cell
      const updated = [...board];
      updated[idx] = currentPlayer;
      setBoard(updated);

      // Check for win or draw after move
      const winner = checkWin(updated);
      const draw = checkDraw(updated);

      // If game not over, switch turn and let AI play next
      if (!winner && !draw) {
        switchTurns();
        setIsAiTurn(true);
      }
    } else {
      // Cell already taken
      toast.error("Cell taken!");
    }
  };

  const switchTurns = () => {
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const checkWin = (boardState) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a]; // Return winner symbol
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
    setRound(1);
    setBoard(Array(9).fill(null));
    setPlayerChoice({ player1: null, player2: null });
    setCurrentPlayer(null);
    setModalConfig({ ...modalConfig, show: false });
    dispatch({ type: "SET_SCORE_UPDATED", payload: false });
    gameEndedRef.current = false;
    setIsAiTurn(false);
    openModal("playerChoice");
  };

  const handleResetConfirm = () => {
    resetEverything();
  };

  // Handler for playing again after game over
  const handlePlayAgainConfirm = () => {
    setBoard(Array(9).fill(null));
    setPlayerChoice({ player1: null, player2: null });
    setCurrentPlayer(null);
    setModalConfig({ ...modalConfig, show: false });
    setRound(round => round + 1);
    dispatch({ type: "SET_SCORE_UPDATED", payload: false });
    gameEndedRef.current = false;
    setIsAiTurn(false);
    openModal("playerChoice");
  }

  // --- Effect: On board/currentPlayer/round change, check for win/draw and show game over modal ---
  useEffect(() => {
    if (!playerChoice.player1 || !playerChoice.player2 || !currentPlayer) {
      whoGoesFirst();
      return;
    }

    const winner = checkWin(board);
    const isDraw = checkDraw(board);

    // If game ended and not already handled, show game over modal
    if ((winner || isDraw) && currentPlayer && !gameEndedRef.current) {
      gameEndedRef.current = true;
      let result = null;
      if (winner) {
        result = winner === playerChoice.player1 ? "player1" : "player2";
      } else if (isDraw) {
        result = "draw";
      }
      if (!scoreUpdated) {
        if (result === "player1" || result === "player2") {
          const newScores = { ...playerScores };
          newScores[result] += 1;
          setPlayerScores(newScores);
          toast.success(`${winner} wins!`);
        } else if (result === "draw") {
          toast.success("It's a draw!");
        }
        dispatch({ type: "SET_SCORE_UPDATED", payload: true });
      }
      openModal("gameOver");
    }
  }, [board, currentPlayer, playerChoice, round, scoreUpdated]);


  // --- Effect: If it's AI's turn, make AI move after a short delay ---
  useEffect(() => {
    if (isAiTurn && isAiTurnNow() && !gameEndedRef.current) {
      // Delay AI move for realism
      const timer = setTimeout(() => {
        const aiMove = getAiMove(board, playerChoice.player2, playerChoice.player1);
        if (aiMove !== null) {
          const updatedBoard = [...board];
          updatedBoard[aiMove] = playerChoice.player2;
          setBoard(updatedBoard);
        }
        setIsAiTurn(false);
        switchTurns();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isAiTurn]);


  return (
    <div className="min-h-screen px-4 app-bg-img">
      <h1 className="text-[#00fff7] text-center font-extrabold text-4xl mb-8 mt-8 drop-shadow-lg tracking-wider uppercase">
        Tik-Tak-Toe With AI
      </h1>

      <h2 className='text-[#ff4ecd] text-center font-extrabold text-3xl mb-10 mt-4 drop-shadow-lg tracking-wider uppercase'>Round: {round}</h2>

      {(isAiTurnNow() || currentPlayer) && (
        <div className="flex justify-center w-full mb-4">
          <div
            className={`text-center font-bold px-4 py-2 rounded-lg ${isAiTurnNow()
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400 shadow-sm'
              : 'bg-blue-100 text-blue-800 border-2 border-blue-400 shadow-sm'
              }`}
            style={{ maxWidth: '300px' }}
          >
            {isAiTurnNow() ? 'AI is thinking' : 'You are thinking'}
          </div>
        </div>
      )}

      <Board board={board} onCellClick={handleCellClick} />

      {modalConfig.show && (
        <CustomModal
          title={modalConfig.title}
          scores={modalConfig.scores}
          buttons={modalConfig.buttons}
        />
      )}

      {showScores && (
        <CustomModal
          title="Score Board"
          scores={{ player1: playerScores.player1, player2: playerScores.player2 }}
          buttons={[
            {
              label: "New Game",
              onClick: () => {
                setShowScores(false);
                resetEverything();
              },
              className: "button-style"
            }
          ]}
        />
      )}

      <div className="text-center mt-10">
        <button
          onClick={resetGame}
          className="button-style"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;