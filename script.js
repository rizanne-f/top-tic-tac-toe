// 1. Managing State with the Module Pattern
const gameboard = (() => {
  let board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  
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
    if (board[index] !== ' ') return false;
    if (!(marker === 'X' || marker === 'O')) return false;
    board[index] = marker;
    return true; 
  };

  const reset = () => {
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  };

  return {
    getBoard,
    printBoard,
    placeMarker,
    reset,
  };
})();

// 2. Factory Functions & Object Encapsulation
function createPlayer(name, marker) {
  let score = 0;
  
  const getScore = () => score;
  const incrementScore = () => score += 1;
  const resetScore = () => score = 0;

  return {
    name,
    marker,
    getScore,
    incrementScore,
    resetScore,
  };
}

// 3. Game Flow and Winning Logic
function checkWinner(board) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]            // diagonals
  ];

  for (let i = 0; i < winningCombos.length; i++) {
    const [a, b, c] = winningCombos[i];

    if (
      board[a] !== ' ' &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return board[a]; 
    }
  }

  if (!board.includes(' ')) return 'tie';

  return null;
}

// 4. Game Controller
function gameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const player1 = createPlayer(playerOneName, 'X');
  const player2 = createPlayer(playerTwoName, 'O');

  let activePlayer = player1;
  let winner = null; 

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  const getActivePlayer = () => activePlayer;
  const getWinner = () => winner;

  const playRound = (index) => {
    if (winner) return;

    const validMove = gameboard.placeMarker(index, activePlayer.marker);
    if (!validMove) return;

    winner = checkWinner(gameboard.getBoard());
    
    // Increment score right here when a winner is found (not in render)
    if (winner && winner !== 'tie') {
      activePlayer.incrementScore();
      return;
    }

    if (winner === 'tie') {
      return;
    }

    switchPlayerTurn();
  };

  // Comprehensive reset function
  const resetGame = () => {
    gameboard.reset();
    winner = null;
    activePlayer = player1; 
  };

  return {
    player1,
    player2,
    playRound,
    getActivePlayer,
    getWinner,
    getBoard: gameboard.getBoard,
    resetGame
  };
}

// 5. Display Controller
const displayController = () => {
  const player1Input = document.getElementById('playerName1');
  const player2Input = document.getElementById('playerName2');
  
  // Initialize game using default or input values
  const game = gameController(player1Input.value || "Player One", player2Input.value || "Player Two");
  
  const playerTurnH1 = document.querySelector("h1");
  const boardDiv = document.querySelector(".board");
  const player1Score = document.getElementById('player1Score');
  const player2Score = document.getElementById('player2Score');
  const restartBtn = document.getElementById('restart');

  const editPlayer1Btn = document.getElementById('editPlayer1Name');
  const editPlayer2Btn = document.getElementById('editPlayer2Name');

  // Handle editing player names
  editPlayer1Btn.addEventListener('click', () => {
    player1Input.disabled = !player1Input.disabled;
    if (!player1Input.disabled) player1Input.focus();
    game.player1.name = player1Input.value || "Player One";
    updateScreen();
  });

  editPlayer2Btn.addEventListener('click', () => {
    player2Input.disabled = !player2Input.disabled;
    if (!player2Input.disabled) player2Input.focus();
    game.player2.name = player2Input.value || "Player Two";
    updateScreen();
  });

  player1Input.addEventListener('input', () => {
    game.player1.name = player1Input.value || "Player One";
    updateScreen();
  });

  player2Input.addEventListener('input', () => {
    game.player2.name = player2Input.value || "Player Two";
    updateScreen();
  });

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const winner = game.getWinner();

    // Update header based on game state (no state changes happening here)
    if (winner === 'tie') {
      playerTurnH1.textContent = "It's a tie!";
    } else if (winner) {
      playerTurnH1.textContent = `${activePlayer.name} (${winner}) wins! 🎉`;
    } else {
      playerTurnH1.textContent = `${activePlayer.name}'s turn (${activePlayer.marker})`;
    }

    board.forEach((cell, index) => {
      const cellButton = document.createElement("button");
      cellButton.classList.add("cell");
      cellButton.dataset.column = index;
      if (cell !== ' ') cellButton.textContent = cell;
      boardDiv.appendChild(cellButton);
    });

    player1Score.textContent = game.player1.getScore();
    player2Score.textContent = game.player2.getScore();
  };

  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    if (selectedColumn === undefined) return; 

    game.playRound(Number(selectedColumn)); 
    updateScreen();
  }

  boardDiv.addEventListener("click", clickHandlerBoard);

  // Hook up the restart button inside the controller scope so it can access `game` and `updateScreen`
  restartBtn.addEventListener('click', () => {
    game.resetGame();
    updateScreen();
  });

  updateScreen();
};

displayController();