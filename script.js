const board = document.getElementById("board");
let selectedPiece = null;
let currentPlayer = "red";

// Create the board and add pieces
function createBoard() {
  for (let i = 0; i < 64; i++) {
    const square = document.createElement("div");
    square.classList.add("square");

    const row = Math.floor(i / 8);
    const col = i % 8;
    const isDark = (row + col) % 2 === 1;
    square.classList.add(isDark ? "dark" : "light");

    // Add pieces
    if (isDark && row < 3) {
      const piece = document.createElement("div");
      piece.classList.add("piece", "black");
      square.appendChild(piece);
    } else if (isDark && row > 4) {
      const piece = document.createElement("div");
      piece.classList.add("piece", "red");
      square.appendChild(piece);
    }

    board.appendChild(square);
  }
}

function clearHighlights() {
  Array.from(board.children).forEach((sq) => {
    sq.style.border = "";
  });
}

function switchPlayer() {
  currentPlayer = currentPlayer === "red" ? "black" : "red";
}

function checkKing(piece, index) {
  const row = Math.floor(index / 8);
  if (
    (piece.classList.contains("red") && row === 0) ||
    (piece.classList.contains("black") && row === 7)
  ) {
    piece.classList.add("king");
    piece.style.boxShadow = "inset 0 0 0 3px gold";
  }
}

function hasCapture(piece, index) {
  const direction = piece.classList.contains("red") ? -1 : 1;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const potentialCaptures = [
    [row + direction * 2, col - 2],
    [row + direction * 2, col + 2],
    [row - direction * 2, col - 2],
    [row - direction * 2, col + 2]
  ];

  return potentialCaptures.some(([r, c]) => {
    const i = r * 8 + c;
    const mRow = (row + r) / 2;
    const mCol = (col + c) / 2;
    const midIdx = mRow * 8 + mCol;

    if (
      r >= 0 && r < 8 &&
      c >= 0 && c < 8 &&
      board.children[i].childElementCount === 0 &&
      board.children[i].classList.contains("dark") &&
      board.children[midIdx].childElementCount === 1 &&
      !board.children[midIdx].firstChild.classList.contains(currentPlayer)
    ) {
      return true;
    }
    return false;
  });
}

function findMandatoryCaptures() {
  const pieces = [];
  Array.from(board.children).forEach((sq, i) => {
    const piece = sq.querySelector(".piece");
    if (piece && piece.classList.contains(currentPlayer)) {
      if (hasCapture(piece, i)) {
        pieces.push(piece);
      }
    }
  });
  return pieces;
}

function highlightMoves(piece) {
  clearHighlights();
  const square = piece.parentElement;
  const index = Array.from(board.children).indexOf(square);
  const row = Math.floor(index / 8);
  const col = index % 8;

  if (piece.classList.contains("king")) {
    const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
    directions.forEach(([dr,dc]) => {
      let r = row + dr;
      let c = col + dc;
      let jumped = false;

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const idx = r * 8 + c;
        const sq = board.children[idx];
        if (sq.childElementCount === 0) {
          sq.style.border = jumped ? "3px dashed orange" : "2px solid yellow";
        } else {
          const p = sq.firstChild;
          if (!jumped && !p.classList.contains(currentPlayer)) {
            jumped = true;
          } else {
            break;
          }
        }
        r += dr;
        c += dc;
      }
    });
  } else {
    const direction = piece.classList.contains("red") ? -1 : 1;
    const moveTargets = [[row + direction, col - 1], [row + direction, col + 1]];
    const captureTargets = [
      [row + direction * 2, col - 2],
      [row + direction * 2, col + 2],
      [row - direction * 2, col - 2],
      [row - direction * 2, col + 2]
    ];

    captureTargets.forEach(([r, c]) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const midRow = (row + r) / 2;
        const midCol = (col + c) / 2;
        const middleSquare = board.children[midRow * 8 + midCol];
        const landingSquare = board.children[r * 8 + c];

        if (
          landingSquare.childElementCount === 0 &&
          landingSquare.classList.contains("dark") &&
          middleSquare.childElementCount === 1 &&
          !middleSquare.firstChild.classList.contains(currentPlayer)
        ) {
          landingSquare.style.border = "3px dashed orange";
        }
      }
    });

    moveTargets.forEach(([r, c]) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const i = r * 8 + c;
        const target = board.children[i];
        if (target.childElementCount === 0 && target.classList.contains("dark")) {
          target.style.border = "2px solid yellow";
        }
      }
    });
  }
}

function tryAnotherCapture(piece) {
  const index = Array.from(board.children).indexOf(piece.parentElement);
  if (hasCapture(piece, index)) {
    selectedPiece = piece;
    highlightMoves(piece);
  } else {
    checkKing(piece, index);
    switchPlayer();
    selectedPiece = null;
    clearHighlights();
  }
}

board.addEventListener("click", (e) => {
  const target = e.target;
  const mandatory = findMandatoryCaptures();

  if (target.classList.contains("piece")) {
    if (
      target.classList.contains(currentPlayer) &&
      (mandatory.length === 0 || mandatory.includes(target))
    ) {
      selectedPiece = target;
      highlightMoves(target);
    }
  } else if (
    selectedPiece &&
    target.classList.contains("square") &&
    target.childElementCount === 0 &&
    target.classList.contains("dark")
  ) {
    const prevSquare = selectedPiece.parentElement;
    const prevIndex = Array.from(board.children).indexOf(prevSquare);
    const newIndex = Array.from(board.children).indexOf(target);
    const rowDiff = Math.abs(Math.floor(prevIndex / 8) - Math.floor(newIndex / 8));

    target.appendChild(selectedPiece);

    if (rowDiff === 2 || selectedPiece.classList.contains("king")) {
      const midRow = (Math.floor(prevIndex / 8) + Math.floor(newIndex / 8)) / 2;
      const midCol = (prevIndex % 8 + newIndex % 8) / 2;
      const midIdx = midRow * 8 + midCol;
      const midSquare = board.children[midIdx];
      midSquare.innerHTML = "";
      tryAnotherCapture(selectedPiece);
    } else {
      checkKing(selectedPiece, newIndex);
      switch
