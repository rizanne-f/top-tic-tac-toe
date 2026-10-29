const Gameboard = (() => {
  let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

  const getBoard = () => board;

  const printBoard = () => `
    +---+---+---+
    | ${board[0]} | ${board[1]} | ${board[2]} |
    +---+---+---+
    | ${board[3]} | ${board[4]} | ${board[5]} |
    +---+---+---+
    | ${board[6]} | ${board[7]} | ${board[8]} |
    +---+---+---+
  `;

  const placeMarker = (index, marker) => {
    if (board[index] === " ") {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const resetBoard = () => {
    board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  };

  return {
    getBoard,
    printBoard,
    placeMarker,
    resetBoard,
  };
})();

function createPlayer(name, marker) {
  let score = 0;

  const getScore = () => score;
  const incrementScore = () => ++score;
  const resetScore = () => (score = 0);

  return {
    name,
    marker,
    getScore,
    incrementScore,
    resetScore,
  };
}

function checkWinner(board) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6], // diagonal
  ];

  for (let i = 0; i < winningCombos.length; i++) {
    const [a, b, c] = winningCombos[i];

    if (board[a] !== " " && board[a] === board[b] && board[b] === board[c])
      return board[a];
  }

  if (!board.includes(" ")) return "tie";

  return null;
}

function GameController(playerOne = "Player One", playerTwo = "Player Two") {
  const player1 = createPlayer(playerOne, "X");
  const player2 = createPlayer(playerTwo, "O");

  let activePlayer = player1;
  let winner = null;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  const getActivePlayer = () => activePlayer;
  const getWinner = () => winner;

  const playRound = (index) => {
    if (winner) return;

    const validMove = Gameboard.placeMarker(index, activePlayer.marker);
    if (!validMove) return;

    winner = checkWinner(Gameboard.getBoard());

    if (winner && winner !== "tie") {
      activePlayer.incrementScore();
      return;
    }

    if (winner === "tie") return;

    switchPlayerTurn();
  };

  const resetGame = () => {
    Gameboard.resetBoard();
    activePlayer = player1;
    winner = null;
  };

  return {
    player1,
    player2,
    getActivePlayer,
    getWinner,
    playRound,
    getBoard: Gameboard.getBoard,
    resetGame,
  };
}

function displayController() {
  const player1Input = document.querySelector("#playerName1");
  const player2Input = document.querySelector("#playerName2");

  const player1Score = document.getElementById("player1Score");
  const player2Score = document.getElementById("player2Score");

  const editPlayer1Btn = document.getElementById("editPlayer1Name");
  const editPlayer2Btn = document.getElementById("editPlayer2Name");

  const playerTurnH1 = document.querySelector("h1");
  const boardDiv = document.querySelector(".board");
  const restartBtn = document.getElementById("restart");

  player1Input.addEventListener("input", () => {
    game.player1.name = player1Input.value || "Player One";
    updateScreen();
  });

  player2Input.addEventListener("input", () => {
    game.player2.name = player2Input.value || "Player Two";
    updateScreen();
  });

  editPlayer1Btn.addEventListener("click", () => {
    player1Input.disabled = !player1Input.disabled;
    if (!player1Input.disabled) player1Input.focus();
    game.player1.name = player1Input.value || "Player One";
    updateScreen();
  });

  editPlayer2Btn.addEventListener("click", () => {
    player2Input.disabled = !player2Input.disabled;
    if (!player2Input.disabled) player2Input.focus();
    game.player2.name = player2Input.value || "Player Two";
    updateScreen();
  });

  const game = GameController(
    player1Input.value || "Player One",
    player2Input.value || "Player Two",
  );

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const winner = game.getWinner();

    if (winner === "tie") {
      playerTurnH1.textContent = "It's a tie!";
    } else if (winner) {
      playerTurnH1.textContent = `${activePlayer.name} (${winner}) wins! 🎉`;
    } else {
      playerTurnH1.textContent = `${activePlayer.name}'s turn (${activePlayer.marker})`;
    }

    board.forEach((cell, index) => {
      const cellButton = document.createElement("button");
      cellButton.classList.add("cell");
      cellButton.dataset.index = index;
      if (cell !== " ") cellButton.textContent = cell;
      boardDiv.appendChild(cellButton);
    });

    player1Score.textContent = game.player1.getScore();
    player2Score.textContent = game.player2.getScore();
  };

  boardDiv.addEventListener("click", (e) => {
    const selectedCell = e.target.dataset.index;
    if (selectedCell === undefined) return;
    game.playRound(Number(selectedCell));
    updateScreen();
  });

  restartBtn.addEventListener("click", () => {
    game.resetGame();
    updateScreen();
  });

  updateScreen();
}

displayController();