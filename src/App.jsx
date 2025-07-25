// ...existing imports...

// React core imports
import { useEffect, useRef, useState } from 'react';

// Toast notification library for user feedback
import toast from 'react-hot-toast';

// Game board component (renders the 3x3 grid)
import Board from './components/Board';

// Modal component for dialogs (player choice, reset, game over, scoreboard)
import CustomModal from './components/CustomModal';

// AI move logic (function to determine AI's next move)
import { getAiMove } from './utils/ai';

// Custom hook for localStorage + reducer (persists state across reloads)
import useLocalStorageWithReducer from "./hooks/useLocalStorageWithReducer";

// Reducer and initial state for game logic
import { gameReducer, initialState } from './reducers/gameReducer';

// App-wide styles
import './App.css';




function App() {
  // --- State Management ---
  // State managed by reducer and persisted in localStorage (key: "gameState")
  const [state, dispatch] = useLocalStorageWithReducer("gameState", gameReducer, initialState);

  // Destructure state for easy access
  const {
    board,           // Array of 9 cells (null, 'X', or 'O')
    currentPlayer,   // Whose turn it is ('X' or 'O')
    round,           // Current round number
    playerScores,    // { player1: number, player2: number }
    playerChoice,    // { player1: 'X'|'O'|null, player2: 'X'|'O'|null }
    isAiTurn,        // Boolean: is it currently AI's turn?
    modalConfig,     // Modal dialog configuration
    scoreUpdated,    // Boolean: has the score been updated for this round?
    showScores       // Boolean: show scoreboard modal?
  } = state;

  // Ref to track if the game has ended (prevents duplicate triggers for game over)
  const gameEndedRef = useRef(false);

  // --- Dispatchers for updating reducer state ---
  // These functions wrap dispatch for convenience and clarity
  const setBoard = (payload) => dispatch({ type: "SET_BOARD", payload });
  const setCurrentPlayer = (payload) => dispatch({ type: "SET_CURRENT_PLAYER", payload });
  const setRound = (payload) => dispatch({ type: "SET_ROUND", payload });
  const setPlayerScores = (payload) => dispatch({ type: "SET_PLAYER_SCORES", payload });
  const setPlayerChoice = (payload) => dispatch({ type: "SET_PLAYER_CHOICE", payload });
  const setIsAiTurn = (payload) => dispatch({ type: "SET_IS_AI_TURN", payload });
  const setModalConfig = (payload) => dispatch({ type: "SET_MODAL_CONFIG", payload });
  const setShowScores = (payload) => dispatch({ type: "SET_SHOW_SCORES", payload });

  // --- Effect: Update scores and close modal if win/draw detected and not already updated ---
  useEffect(() => {
    // Check for winner or draw
    const winner = checkWin(board);
    const isDraw = checkDraw(board);
    if ((winner || isDraw) && !scoreUpdated) {
      let result = null;
      if (winner) {
        // Determine if player1 or player2 won
        result = winner === playerChoice.player1 ? "player1" : "player2";
      } else if (isDraw) {
        result = "draw";
      }
      // Update scores if there is a winner
      if (result === "player1" || result === "player2") {
        const newScores = { ...playerScores };
        newScores[result] += 1;
        setPlayerScores(newScores);
      }
      // Mark score as updated and close modal
      dispatch({ type: "SET_SCORE_UPDATED", payload: true });
      setModalConfig({ ...modalConfig, show: false });
    }
  }, [board, playerChoice, scoreUpdated]);

  // --- Modal Dialogs: Player choice, reset, game over ---
  // Opens a modal dialog based on the type requested
  const openModal = (type) => {
    switch (type) {
      case "playerChoice":
        // Modal for choosing who goes first (X or O)
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
        // Modal for game over, ask to play again or show scoreboard
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
                // Show scoreboard after a short delay
                setTimeout(() => setShowScores(true), 100);
              },
              className: "px-6 py-2 border-2 border-black rounded-lg font-semibold text-black hover:bg-black hover:text-white transition-all"
            }
          ]
        });
        break;
    }
  }


  // Returns true if it's currently the AI's turn (player2 is always AI)
  const isAiTurnNow = () => {
    return currentPlayer && playerChoice.player2 === currentPlayer;
  }


  // Ask user who goes first (X or O) via modal
  const whoGoesFirst = () => {
    openModal("playerChoice");
  };


  // Handle player selection (X or O) and update state accordingly
  const handlePlayerSelection = (choice) => {
    setCurrentPlayer(choice); // Set who goes first
    setPlayerChoice({ player1: choice, player2: choice === "X" ? "O" : "X" }); // Assign AI the other symbol
    setModalConfig({ ...modalConfig, show: false }); // Close modal
  };


  // Handle click on a cell: update board, check win/draw, switch turn, or show error
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
        setIsAiTurn(true); // Trigger AI move
      }
    } else {
      // Cell already taken
      toast.error("Cell taken!");
    }
  };



  // Switch current player between X and O
  const switchTurns = () => {
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };


  // Check if a player has won. Returns 'X', 'O', or null
  // Checks all possible winning combinations
  const checkWin = (boardState) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a]; // Return winner symbol
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


  // Reset all game state and ask who goes first (used for new game)
  const resetEverything = () => {
    setPlayerScores({ player1: 0, player2: 0 }); // Reset scores
    setRound(1);                                // Reset round
    setBoard(Array(9).fill(null));              // Clear board
    setPlayerChoice({ player1: null, player2: null }); // Clear player choices
    setCurrentPlayer(null);                     // Clear current player
    setModalConfig({ ...modalConfig, show: false }); // Close modal
    dispatch({ type: "SET_SCORE_UPDATED", payload: false }); // Reset score update flag
    gameEndedRef.current = false;               // Reset game ended ref
    setIsAiTurn(false);                         // Reset AI turn
    openModal("playerChoice");                  // Ask who goes first
  };


  // Handler for confirming reset (from modal)
  const handleResetConfirm = () => {
    resetEverything();
  };


  // Handler for playing again after game over (from modal)
  const handlePlayAgainConfirm = () => {
    setBoard(Array(9).fill(null));              // Clear board
    setPlayerChoice({ player1: null, player2: null }); // Clear player choices
    setCurrentPlayer(null);                     // Clear current player
    setModalConfig({ ...modalConfig, show: false }); // Close modal
    setRound(round => round + 1);               // Increment round
    dispatch({ type: "SET_SCORE_UPDATED", payload: false }); // Reset score update flag
    gameEndedRef.current = false;               // Reset game ended ref
    setIsAiTurn(false);                         // Reset AI turn
    openModal("playerChoice");                  // Ask who goes first
  }


  // --- Effect: On board/currentPlayer/round change, check for win/draw and show game over modal ---
  useEffect(() => {
    // If player choices or current player not set, ask who goes first
    if (!playerChoice.player1 || !playerChoice.player2 || !currentPlayer) {
      whoGoesFirst();
      return;
    }

    // Check for winner or draw
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
        // Get AI's move (returns index or null)
        const aiMove = getAiMove(board, playerChoice.player2, playerChoice.player1);
        if (aiMove !== null) {
          // Place AI's symbol on the board
          const updatedBoard = [...board];
          updatedBoard[aiMove] = playerChoice.player2;
          setBoard(updatedBoard);
        }
        setIsAiTurn(false); // End AI turn
        switchTurns();      // Switch back to player
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isAiTurn]);


  // --- Render main UI ---
  return (
    <div className="min-h-screen bg-gray-50 px-4">
      {/* Title */}
      <h1 className="text-[tomato] text-center font-extrabold text-4xl mb-10 mt-6 drop-shadow-sm">
        Tik-Tak-Toe With AI
      </h1>

      {/* Round number */}
      <h2 className='text-[tomato] text-center font-extrabold text-3xl mb-10 mt-6 drop-shadow-sm'>Round: {round}</h2>

      {/* Show whose turn it is (AI or player) */}
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

      {/* Game board (3x3 grid) */}
      <Board board={board} onCellClick={handleCellClick} />

      {/* Modal for player choice, reset, or game over */}
      {modalConfig.show && (
        <CustomModal
          title={modalConfig.title}
          scores={modalConfig.scores}
          buttons={modalConfig.buttons}
        />
      )}

      {/* Scoreboard modal (shows after game over if user chooses 'No') */}
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

      {/* Reset game button (bottom of page) */}
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


// Export main App component
export default App;