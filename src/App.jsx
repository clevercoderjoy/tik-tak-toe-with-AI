// ...existing imports...

// React imports
import { useEffect, useRef, useState } from 'react';
// Toast notification library
import toast from 'react-hot-toast';
// Game board component
import Board from './components/Board';
// Modal component for dialogs
import CustomModal from './components/CustomModal';
// AI move logic
import { getAiMove } from './utils/ai';
// Custom hook for localStorage + reducer
import useLocalStorageWithReducer from "./hooks/useLocalStorageWithReducer";
// Reducer and initial state for game
import { gameReducer, initialState } from './reducers/gameReducer';
// Styles
import './App.css';



function App() {
  // State managed by reducer and persisted in localStorage
  const [state, dispatch] = useLocalStorageWithReducer("gameState", gameReducer, initialState);
  // Destructure state for easy access
  const { board, currentPlayer, round, playerScores, playerChoice, isAiTurn, modalConfig, scoreUpdated } = state;
  // Local UI state for showing the scoreboard
  const [showScores, setShowScores] = useState(false);
  // Ref to track if the game has ended (prevents duplicate triggers)
  const gameEndedRef = useRef(false);

  // Dispatchers for updating reducer state
  const setBoard = (payload) => dispatch({ type: "SET_BOARD", payload });
  const setCurrentPlayer = (payload) => dispatch({ type: "SET_CURRENT_PLAYER", payload });
  const setRound = (payload) => dispatch({ type: "SET_ROUND", payload });
  const setPlayerScores = (payload) => dispatch({ type: "SET_PLAYER_SCORES", payload });
  const setPlayerChoice = (payload) => dispatch({ type: "SET_PLAYER_CHOICE", payload });
  const setIsAiTurn = (payload) => dispatch({ type: "SET_IS_AI_TURN", payload });
  const setModalConfig = (payload) => dispatch({ type: "SET_MODAL_CONFIG", payload });

  // Effect: Update scores and close modal if win/draw detected and not already updated
  useEffect(() => {
    const winner = checkWin(board);
    const isDraw = checkDraw(board);
    if ((winner || isDraw) && !scoreUpdated) {
      let result = null;
      if (winner) {
        result = winner === playerChoice.player1 ? "player1" : "player2";
      } else if (isDraw) {
        result = "draw";
      }
      if (result === "player1" || result === "player2") {
        const newScores = { ...playerScores };
        newScores[result] += 1;
        setPlayerScores(newScores);
      }
      dispatch({ type: "SET_SCORE_UPDATED", payload: true });
      setModalConfig({ ...modalConfig, show: false });
    }
  }, [board, playerChoice, scoreUpdated]);

  // Show modal dialogs for player choice, reset, or game over
  const openModal = (type) => {
    switch (type) {
      case "playerChoice":
        // Modal for choosing who goes first
        setModalConfig({
          show: true,
          type,
          title: "Who goes first?",
          buttons: [
            {
              label: "O",
              onClick: () => handlePlayerSelection("O"),
              className: "flex items-center justify-center gap-2 px-2 py-1 border-2 border-gray-800 rounded-lg font-bold text-black hover:bg-black hover:text-white transition-all"
            },
            {
              label: "X",
              onClick: () => handlePlayerSelection("X"),
              className: "flex items-center justify-center gap-2 px-2 py-1 border-2 border-gray-800 rounded-lg font-bold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
      case "resetGame":
        // Modal for confirming game reset
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
        // Modal for game over, ask to play again
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
              onClick: () => {
                setModalConfig({ ...modalConfig, show: false });
                setTimeout(() => setShowScores(true), 100);
              },
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
    }
  }

  // Returns true if it's currently the AI's turn
  const isAiTurnNow = () => {
    return currentPlayer && playerChoice.player2 === currentPlayer;
  }

  // Ask user who goes first
  const whoGoesFirst = () => {
    openModal("playerChoice");
  };

  // Handle player selection (X or O) and update state
  const handlePlayerSelection = (choice) => {
    setCurrentPlayer(choice);
    setPlayerChoice({ player1: choice, player2: choice === "X" ? "O" : "X" });
    setModalConfig({ ...modalConfig, show: false });
  };

  // Handle click on a cell: update board, check win/draw, switch turn, or show error
  const handleCellClick = (idx) => {
    // Ignore clicks if it's AI's turn, game ended, or AI is thinking
    if (isAiTurnNow() || gameEndedRef.current || isAiTurn) return;
    if (board[idx] === null) {
      const updated = [...board];
      updated[idx] = currentPlayer;
      setBoard(updated);

      const winner = checkWin(updated);
      const draw = checkDraw(updated);

      if (!winner && !draw) {
        switchTurns();
        setIsAiTurn(true);
      }
    } else {
      toast.error("Cell taken!");
    }
  };


  // Switch current player between X and O
  const switchTurns = () => {
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  // Check if a player has won. Returns 'X', 'O', or null
  const checkWin = (boardState) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a];
      }
    }
    return null;
  }

  // Check if the board is full and no winner (draw)
  const checkDraw = (boardState) => {
    return !boardState.includes(null)
  }

  // Show reset game confirmation modal
  const resetGame = () => {
    openModal("resetGame");
  };

  // Reset all game state and ask who goes first
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

  // Handler for confirming reset
  const handleResetConfirm = () => {
    resetEverything();
  };

  // No longer needed: handlePlayAgainCancel

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

  // Effect: On board/currentPlayer/round change, check for win/draw and show game over modal
  useEffect(() => {
    // If player choices or current player not set, ask who goes first
    if (!playerChoice.player1 || !playerChoice.player2 || !currentPlayer) {
      whoGoesFirst();
      return;
    }

    const winner = checkWin(board);
    const isDraw = checkDraw(board);

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

  // Effect: If it's AI's turn, make AI move after a short delay
  useEffect(() => {
    if (isAiTurn && isAiTurnNow() && !gameEndedRef.current) {
      const timer = setTimeout(() => {
        // Get AI's move
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

  // Render main UI
  return (
    <div className="min-h-screen bg-gray-50 px-4">
      {/* Title */}
      <h1 className="text-[tomato] text-center font-extrabold text-4xl mb-10 mt-6 drop-shadow-sm">
        Tik-Tak-Toe With AI
      </h1>

      {/* Round number */}
      <h2 className='text-[tomato] text-center font-extrabold text-3xl mb-10 mt-6 drop-shadow-sm'>Round: {round}</h2>

      {/* Show whose turn it is */}
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

      {/* Game board */}
      <Board board={board} onCellClick={handleCellClick} />

      {/* Modal for player choice, reset, or game over */}
      {modalConfig.show && (
        <CustomModal
          title={modalConfig.title}
          scores={modalConfig.scores}
          buttons={modalConfig.buttons}
        />
      )}

      {/* Scoreboard modal */}
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
              className: "px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
            }
          ]}
        />
      )}

      {/* Reset game button */}
      <div className="text-center mt-10">
        <button
          onClick={resetGame}
          className="px-6 py-2 mb-4 text-lg font-bold bg-black text-white rounded-lg border-2 border-black hover:bg-[tomato] hover:border-[tomato] transition-all"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;