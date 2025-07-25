const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return the winner symbol
    }
  }
  return null; // No winner
};

// Checks if the board is full
const isBoardFull = (board) => {
  return !board.includes(null);
};

// Returns an array of indices for all empty cells
const getAvailableMoves = (board) => {
  return board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);
};

// Minimax algorithm with alpha-beta pruning
// Recursively evaluates all possible moves and returns the best score
// - board: current board state
// - depth: current recursion depth
// - isMaximizing: true if it's AI's turn, false if it's human's turn
// - alpha, beta: pruning values
// - ai: AI's symbol ('X' or 'O')
// - human: Human's symbol ('X' or 'O')
const minimax = (board, depth, isMaximizing, alpha, beta, ai, human) => {
  const winner = checkWinner(board);

  // Base cases: return score if game is over
  if (winner === ai) {
    return 10 - depth; // AI wins: prefer faster wins
  }
  if (winner === human) {
    return depth - 10; // Human wins: prefer slower losses
  }
  if (isBoardFull(board)) {
    return 0; // Draw
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    // AI's turn: maximize the score
    let bestScore = -Infinity;
    for (let move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = ai;
      const score = minimax(newBoard, depth + 1, false, alpha, beta, ai, human);
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore); // Update alpha
      if (beta <= alpha) break; // Beta cut-off
    }
    return bestScore;
  } else {
    // Human's turn: minimize the score
    let bestScore = Infinity;
    for (let move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = human;
      const score = minimax(newBoard, depth + 1, true, alpha, beta, ai, human);
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore); // Update beta
      if (beta <= alpha) break; // Alpha cut-off
    }
    return bestScore;
  }
};


// Returns the best move for the AI using minimax
// - board: current board state
// - ai: AI's symbol ('X' or 'O')
// - human: Human's symbol ('X' or 'O')
export const getAiMove = (board, ai, human) => {
  const availableMoves = getAvailableMoves(board);
  let bestMove = null;
  let bestScore = -Infinity;

  // Try every possible move for the AI
  for (let move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = ai;
    // Evaluate this move using minimax (AI just played, so next is human)
    const score = minimax(newBoard, 0, false, -Infinity, Infinity, ai, human);

    // Keep track of the move with the highest score
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};
