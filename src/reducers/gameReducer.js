export const initialState = {
  board: Array(9).fill(null),
  currentPlayer: null,
  round: 1,
  playerScores: { player1: 0, player2: 0 },
  playerChoice: { player1: null, player2: null },
  isAiTurn: false,
  modalConfig: {
    show: false,
    type: "",
    title: "",
    buttons: [],
  },
  gameResult: null,
  scoreUpdated: false,
  showScores: false,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "SET_CURRENT_PLAYER":
      return { ...state, currentPlayer: action.payload };
    case "SET_ROUND":
      return { ...state, round: action.payload };
    case "SET_PLAYER_SCORES":
      return { ...state, playerScores: action.payload };
    case "SET_PLAYER_CHOICE":
      return { ...state, playerChoice: action.payload };
    case "SET_IS_AI_TURN":
      return { ...state, isAiTurn: action.payload };
    case "SET_MODAL_CONFIG":
      return { ...state, modalConfig: action.payload };
    case "SET_GAME_RESULT":
      return { ...state, gameResult: action.payload };
    case "SET_SCORE_UPDATED":
      return { ...state, scoreUpdated: action.payload };
    case "SET_SHOW_SCORES":
      return { ...state, showScores: action.payload };
    case "RESET_GAME":
      return { ...initialState };
    default:
      return state;
  }
}
