import Image from 'next/image';
import styles from './game.module.css'
import { useMemo, useState } from "react";

enum PieceName {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}
enum PieceColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

type Piece = {
  name: PieceName,
  color: PieceColor,
  img: string
}

type Square = {
  column: string;
  row: number;
  piece?: Piece;
  active?:boolean
};

const generatePieces = (): Record<string, Piece> => {
  const pieces: Record<string, Piece> = {};
  const pieceNames = Object.values(PieceName);
  const pieceColors = Object.values(PieceColor);

  for (const color of pieceColors) {
    for (const name of pieceNames) {
      const key = `${name}_${color}`;
      const img = `${name.toLowerCase()}_${color.toLowerCase()}.svg`;
      pieces[key] = { name, color, img };
    }
  }

  return pieces;
};


const PIECES = generatePieces()

const INITIAL_POSITIONS: Record<string, string> = {
  // WHITE INITIAL POSITIONS
  'A1': 'ROOK_WHITE',
  'B1': 'KNIGHT_WHITE',
  'C1': 'BISHOP_WHITE',
  'D1': 'QUEEN_WHITE',
  'E1': 'KING_WHITE',
  'F1': 'BISHOP_WHITE',
  'G1': 'KNIGHT_WHITE',
  'H1': 'ROOK_WHITE',
  'A2': 'PAWN_WHITE',
  'B2': 'PAWN_WHITE',
  'C2': 'PAWN_WHITE',
  'D2': 'PAWN_WHITE',
  'E2': 'PAWN_WHITE',
  'F2': 'PAWN_WHITE',
  'G2': 'PAWN_WHITE',
  'H2': 'PAWN_WHITE',
  // BLACK INITIAL POSITION 
  'A8': 'ROOK_BLACK',
  'B8': 'KNIGHT_BLACK',
  'C8': 'BISHOP_BLACK',
  'D8': 'QUEEN_BLACK',
  'E8': 'KING_BLACK',
  'F8': 'BISHOP_BLACK',
  'G8': 'KNIGHT_BLACK',
  'H8': 'ROOK_BLACK',
  'A7': 'PAWN_BLACK',
  'B7': 'PAWN_BLACK',
  'C7': 'PAWN_BLACK',
  'D7': 'PAWN_BLACK',
  'E7': 'PAWN_BLACK',
  'F7': 'PAWN_BLACK',
  'G7': 'PAWN_BLACK',
  'H7': 'PAWN_BLACK'
}

export default function Game() {
  
  const setUpInitialPieces = (squares: Square[][]): Square[][] => {
    return squares.map(row =>
      row.map(square => {
        const coords = `${square.column}${square.row}`;
        const piece = PIECES[INITIAL_POSITIONS[coords]];
        return piece ? { ...square, piece,active:false } : square;
      })
    );
  };

  const board = useMemo(() => {
    console.log("recalculating the board");
    
    const board: Square[][] = [...Array(8)].map((_, i) =>
      [...Array(8)].map((_, j) => ({
        column: String.fromCharCode('A'.charCodeAt(0) + j),
        row: 9 - i - 1,
        active : false
      }))
    );
    return setUpInitialPieces(board);
  }, []);

  const [updatedBoard,setUpdatedBoard] = useState(board)
  const [availableMoves,setAvailableMoves] = useState<Square[]>([])



  const handleClick = (event: React.MouseEvent<HTMLElement>,clickedSquare:Square) => {
    console.log("clicked square : ",clickedSquare);
    
    event.preventDefault();
    const foundSquare = board.flat().find(square => square.column === clickedSquare.column && square.row === clickedSquare.row);
    if (foundSquare){
      toggleSquareActive(foundSquare)
      getPossibleMovesForPiece(foundSquare)
    }
  }


  const getPossibleMovesForPiece = (clickedSquare: Square) => {
    const piece = clickedSquare.piece
    if (!piece){
      return []
    }

    const possibleMoves:Square[] = [];
    if (piece.name === PieceName.PAWN){
      const direction = piece.color === PieceColor.WHITE ? 1 : -1
      const forwardMove = {
        column : clickedSquare.column,
        row :clickedSquare.row + direction
      }

      if (isPawnFirstTimeMoving(clickedSquare)){
        // If the pawn is moving for the first time, it can move two squares forward
        const secondForwardMove = {
          column: clickedSquare.column,
          row: clickedSquare.row + (direction *  2),
        };
         // Check if the second forward move is within the board and if there's no piece there
        if (isWithinBoard(secondForwardMove) && !isSquareOccupied(secondForwardMove,updatedBoard)) {
          possibleMoves.push(secondForwardMove);
        }
      }

      if (isWithinBoard(forwardMove) && !isSquareOccupied(forwardMove,updatedBoard)) {
        possibleMoves.push(forwardMove);
      }
     }
     console.log(`possible moves for  piece : ${piece.name}-${piece.color} : `,possibleMoves);
     setAvailableMoves(possibleMoves)
  }

  // Helper functions to check if a move is within the board and if a square is occupied
  const isWithinBoard = (square: Square): boolean => {
    return square.row >=  1 && square.row <=  8 && square.column >= 'A' && square.column <= 'H';
  };

  const isSquareOccupied = (square: Square, board: Square[][]): boolean => {
    return board.flat().some(s => s.column === square.column && s.row === square.row && s.piece);
  };

  const isPawnFirstTimeMoving = (square:Square) => {
    const squarePosition = `${square.column}${square.row}`
    //check if the clicked squareposiiton  is in the starting positions of white or black pawns
    const foundPiece = PIECES[INITIAL_POSITIONS[squarePosition]]
    return foundPiece && foundPiece.name === PieceName.PAWN
  }

  const getStyle = (row: number) => {
    return row % 2 === 0 ? styles.white : styles.black;
  };

  const squareHasPiece = (square: Square) => {
    return !!square.piece;
  }

  const isListedInPossibleMoves = (square:Square) => {
    return !!availableMoves.find(move => move.row === square.row && move.column === square.column )
  }

 const toggleSquareActive = (foundSquare:Square) => {
    const updatedBoard = board.map(row =>
      row.map(square =>
        square.column === foundSquare.column && square.row === foundSquare.row
          ? { ...square, active: !square.active } // Update the active field
          : square
      ));
      setUpdatedBoard(updatedBoard)
  }

  return (
    <main className={styles.container}>
      <div className={styles.grid}>
        {updatedBoard.map((outerSquares, outerId) => {
          return outerSquares.map((square, innerId) => {
            const key = `${square.column}${square.row}`; // Unique key for each square
            return (
              <div
                style={{ textAlign: 'center' }}
                className={`${styles.square} ${getStyle(outerId + innerId)} ${isListedInPossibleMoves(square)?styles.recommended:''} ${ square.active ? styles.active :''}`}
                key={key}
              >
                {squareHasPiece(square) ? (
      
                  <Image
                    onClick={(e)=>handleClick(e,square)}
                    priority={true}
                    height={100}
                    width={100}
                    src={square.piece?.img || ''}
                    alt={`${square.piece?.color} ${square.piece?.name}`}
                  />
                ) : (
                  <div></div>
                )}
              </div>
            );
          });
        })}
      </div>
    </main>
  );
}