import React from 'react';

interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === 'w';

  // Crisp standard SVG chess pieces
  switch (type) {
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke={isWhite ? "#000" : "#fff"} />
          </g>
        </svg>
      );
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-27 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm20 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path
              d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7.5-17L16 25l-7-11 2 12z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path
              d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 4c3.5-1 17.5-1 21 0" stroke={isWhite ? "#000" : "#fff"} />
          </g>
        </svg>
      );
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-12.5h14L31 31.5H14zM11 19h23l1.5-5H31v-3.5h-4.5V14h-3v-3.5h-2V14h-3v-3.5H11V14h-4.5L8 19z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path d="M12 36h21m-19-4.5h17m-17-12.5h17" stroke={isWhite ? "#000" : "#fff"} />
          </g>
        </svg>
      );
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <g fill={isWhite ? "#fff" : "#1a1a1a"} stroke={isWhite ? "#000" : "#fff"}>
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5" stroke={isWhite ? "#000" : "#fff"} />
          </g>
        </svg>
      );
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path
              d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.64 1.1-2 1-1 0-.72-1.41-1.5-1.5-.78-.09-1.41.9-2 1-.59.1-1.41-1.2-2-1-.6-.2-1.5.5-2 .5-1.1-1 1-4 2.5-6.5C5.5 19 6.5 16 11 14c4-2 7.5-1.5 10-1.5 2 0 4 1 5.5 2.5"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-8a1 1 0 1 1-2 0 1 1 0 1 1 2 0z" fill={isWhite ? "#000" : "#fff"} stroke="none" />
          </g>
        </svg>
      );
    case 'p':
    default:
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
              fill={isWhite ? "#fff" : "#1a1a1a"}
              stroke={isWhite ? "#000" : "#fff"}
            />
          </g>
        </svg>
      );
  }
};
