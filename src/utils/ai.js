const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const isBoardFull = (board) => {
  return !board.includes(null);
};

const getAvailableMoves = (board) => {
  return board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);
};

const minimax = (board, depth, isMaximizing, alpha, beta, ai, human) => {
  const winner = checkWinner(board);

  if (winner === ai) {
    return 10 - depth;
  }
  if (winner === human) {
    return depth - 10;
  }
  if (isBoardFull(board)) {
    return 0;
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = ai;
      const score = minimax(newBoard, depth + 1, false, alpha, beta, ai, human);
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(bestScore, score);
      if (beta <= alpha) break;
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = human;
      const score = minimax(newBoard, depth + 1, true, alpha, beta, ai, human);
      bestScore = Math.min(bestScore, score);
      beta = Math.min(bestScore, score);
      if (beta <= alpha) break;
    }
    return bestScore;
  }
};

export const getAiMove = (board, ai, human) => {
  const availableMoves = getAvailableMoves(board);
  let bestMove = null;
  let bestScore = -Infinity;

  for (let move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = ai;
    const score = minimax(newBoard, 0, false, -Infinity, Infinity, ai, human);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};
