import React, { useState, useMemo, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Move } from 'chess.js';
import { RotateCcw, Play, Undo2, Award, AlertCircle } from 'lucide-react';
import { ChessPiece } from './components/ChessPiece';

// Synthesize pleasant, lightweight physical chess sounds using standard Web Audio API
const playSound = (type: 'move' | 'capture' | 'check' | 'gameover') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'capture') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'check') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.setValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // audio failure fallback is safe to ignore
  }
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PromotionState {
  from: Square;
  to: Square;
  color: 'w' | 'b';
}

export default function App() {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [promotionPending, setPromotionPending] = useState<PromotionState | null>(null);
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  // Board layout
  const board = useMemo(() => game.board(), [game]);
  const turn = game.turn(); // 'w' or 'b'
  const isCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isDraw = game.isDraw();
  const isGameOver = game.isGameOver();

  // Get legal moves for currently selected square
  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      return game.moves({ square: selectedSquare, verbose: true }) as Move[];
    } catch {
      return [];
    }
  }, [game, selectedSquare]);

  const legalTargetSquares = useMemo(() => {
    const targets = new Map<string, Move>();
    for (const move of legalMovesForSelected) {
      targets.set(move.to, move);
    }
    return targets;
  }, [legalMovesForSelected]);

  // Captured pieces calculation
  const capturedPieces = useMemo(() => {
    const initialCounts: Record<string, number> = {
      p: 8, n: 2, b: 2, r: 2, q: 1
    };
    const currentWhite: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const currentBlack: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };

    for (const row of board) {
      for (const piece of row) {
        if (!piece || piece.type === 'k') continue;
        if (piece.color === 'w') {
          currentWhite[piece.type] = (currentWhite[piece.type] || 0) + 1;
        } else {
          currentBlack[piece.type] = (currentBlack[piece.type] || 0) + 1;
        }
      }
    }

    const whiteCaptured: PieceSymbol[] = []; // Black pieces taken by White
    const blackCaptured: PieceSymbol[] = []; // White pieces taken by Black

    for (const [type, max] of Object.entries(initialCounts)) {
      const lostByBlack = max - (currentBlack[type] || 0);
      for (let i = 0; i < lostByBlack; i++) whiteCaptured.push(type as PieceSymbol);

      const lostByWhite = max - (currentWhite[type] || 0);
      for (let i = 0; i < lostByWhite; i++) blackCaptured.push(type as PieceSymbol);
    }

    return { whiteCaptured, blackCaptured };
  }, [board]);

  // Execute a verified legal move
  const executeMove = useCallback((from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move({
        from,
        to,
        promotion: promotion || 'q'
      });

      if (moveResult) {
        setGame(newGame);
        setSelectedSquare(null);
        setLastMove({ from, to });
        setPromotionPending(null);

        // Sound feedback
        if (newGame.isGameOver()) {
          playSound('gameover');
        } else if (newGame.inCheck()) {
          playSound('check');
        } else if (moveResult.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }
    } catch (e) {
      console.error('Invalid move:', e);
    }
  }, [game]);

  // Handle square tap/click
  const handleSquareClick = useCallback((square: Square) => {
    if (isGameOver || promotionPending) return;

    const pieceOnSquare = game.get(square);

    // If already selected a piece and tapped a valid target square
    if (selectedSquare) {
      const targetMove = legalTargetSquares.get(square);
      if (targetMove) {
        // Check if move requires promotion
        const isPromotion =
          targetMove.piece === 'p' &&
          ((targetMove.color === 'w' && square[1] === '8') ||
           (targetMove.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPromotionPending({
            from: selectedSquare,
            to: square,
            color: targetMove.color
          });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }
    }

    // Select piece if it belongs to current player's turn
    if (pieceOnSquare && pieceOnSquare.color === turn) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }, [game, selectedSquare, legalTargetSquares, turn, isGameOver, promotionPending, executeMove]);

  // Start new game
  const handleNewGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setLastMove(null);
    setPromotionPending(null);
    setConfirmNewGame(false);
    playSound('move');
  }, []);

  // Undo move
  const handleUndo = useCallback(() => {
    if (game.history().length === 0) return;
    const newGame = new Chess(game.fen());
    newGame.undo();
    setGame(newGame);
    setSelectedSquare(null);
    setLastMove(null);
    playSound('move');
  }, [game]);

  // King in check square
  const kingInCheckSquare = useMemo(() => {
    if (!isCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return piece.square;
        }
      }
    }
    return null;
  }, [board, isCheck, turn]);

  // Game status label
  const statusLabel = useMemo(() => {
    if (isCheckmate) {
      const winner = turn === 'w' ? 'Black' : 'White';
      const winnerAr = turn === 'w' ? 'الأسود' : 'الأبيض';
      return { text: `كش مات! الفائز: ${winnerAr} (${winner})`, color: 'bg-red-950 text-red-200 border-red-800' };
    }
    if (isDraw) {
      return { text: 'تعادل (Draw)', color: 'bg-amber-950 text-amber-200 border-amber-800' };
    }
    if (isCheck) {
      return { text: 'كش ملك! (Check)', color: 'bg-rose-900 text-rose-100 border-rose-700 animate-pulse' };
    }
    return {
      text: turn === 'w' ? 'دور الأبيض (White to move)' : 'دور الأسود (Black to move)',
      color: 'bg-slate-800 text-slate-200 border-slate-700'
    };
  }, [isCheckmate, isDraw, isCheck, turn]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-slate-900/90 border-b border-slate-800 z-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg shadow-sm">
            ♔
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">Simple Chess</h1>
            <p className="text-[10px] text-slate-400">شطرنج كلاسيكي سريع</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          <button
            onClick={handleUndo}
            disabled={game.history().length === 0}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-xs text-slate-200 font-medium transition"
            title="تراجع عن النقلة"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تراجع</span>
          </button>

          <button
            onClick={() => setConfirmNewGame(true)}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs text-white font-semibold shadow-sm transition"
            title="بدء لعبة جديدة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>
      </header>

      {/* Main Playing Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 max-w-lg mx-auto w-full overflow-hidden">
        {/* Status & Opponent Player Info (Black) */}
        <div className="w-full flex items-center justify-between px-2 py-1 mb-1 text-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className={`w-3 h-3 rounded-full border border-slate-500 ${turn === 'b' ? 'bg-black ring-2 ring-emerald-400' : 'bg-black'}`} />
            <span className="font-semibold text-slate-200">الأسود (Black)</span>
          </div>

          {/* Captured White pieces */}
          <div className="flex items-center space-x-0.5 rtl:space-x-reverse h-5">
            {capturedPieces.blackCaptured.map((p, idx) => (
              <div key={idx} className="w-4 h-4 opacity-80">
                <ChessPiece type={p} color="w" />
              </div>
            ))}
          </div>
        </div>

        {/* Turn Status Alert Banner */}
        <div className={`w-full py-1.5 px-3 mb-2 rounded-lg border text-center text-xs font-medium shadow-sm transition-colors ${statusLabel.color}`}>
          {statusLabel.text}
        </div>

        {/* Chess Board Container */}
        <div className="w-full aspect-square max-w-[min(90vw,440px)] max-h-[min(90vw,440px)] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 relative">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {RANKS.map((rank, rankIdx) =>
              FILES.map((file, fileIdx) => {
                const square = `${file}${rank}` as Square;
                const isLight = (rankIdx + fileIdx) % 2 === 0;
                const piece = game.get(square);
                const isSelected = selectedSquare === square;
                const isLegalTarget = legalTargetSquares.has(square);
                const isCheckSquare = kingInCheckSquare === square;
                const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);

                // Square styling
                const baseBg = isLight ? 'bg-[#ebecd0]' : 'bg-[#739552]';
                const rankLabel = fileIdx === 0 ? rank : null;
                const fileLabel = rankIdx === 7 ? file : null;

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors duration-75 ${baseBg} ${
                      isSelected ? '!bg-amber-300/80 ring-2 ring-inset ring-amber-500' : ''
                    } ${
                      isCheckSquare ? '!bg-red-500/90 animate-pulse ring-2 ring-inset ring-red-700' : ''
                    } ${
                      isLastMoveSquare && !isSelected ? 'after:absolute after:inset-0 after:bg-yellow-400/25' : ''
                    }`}
                  >
                    {/* Rank & File Coordinates on edge squares */}
                    {rankLabel && (
                      <span className={`absolute top-0.5 left-0.5 text-[9px] font-bold leading-none pointer-events-none select-none ${isLight ? 'text-[#739552]' : 'text-[#ebecd0]'}`}>
                        {rankLabel}
                      </span>
                    )}
                    {fileLabel && (
                      <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-bold leading-none pointer-events-none select-none ${isLight ? 'text-[#739552]' : 'text-[#ebecd0]'}`}>
                        {fileLabel}
                      </span>
                    )}

                    {/* Chess Piece */}
                    {piece && (
                      <div className="w-[84%] h-[84%] flex items-center justify-center pointer-events-none z-[1] drop-shadow-sm transition-transform active:scale-95">
                        <ChessPiece type={piece.type} color={piece.color} />
                      </div>
                    )}

                    {/* Legal Move Indicators */}
                    {isLegalTarget && !piece && (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900/35 pointer-events-none z-[2]" />
                    )}
                    {isLegalTarget && piece && (
                      <div className="absolute inset-0 border-4 border-slate-900/40 rounded-full m-1 pointer-events-none z-[2]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Player Info (White) */}
        <div className="w-full flex items-center justify-between px-2 py-1 mt-1 text-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className={`w-3 h-3 rounded-full border border-slate-400 ${turn === 'w' ? 'bg-white ring-2 ring-emerald-400' : 'bg-white'}`} />
            <span className="font-semibold text-slate-200">الأبيض (White)</span>
          </div>

          {/* Captured Black pieces */}
          <div className="flex items-center space-x-0.5 rtl:space-x-reverse h-5">
            {capturedPieces.whiteCaptured.map((p, idx) => (
              <div key={idx} className="w-4 h-4 opacity-80">
                <ChessPiece type={p} color="b" />
              </div>
            ))}
          </div>
        </div>

        {/* Moves Summary Strip */}
        <div className="w-full mt-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-medium text-slate-300">
            عدد النقلات: {Math.ceil(game.history().length / 2)}
          </span>
          <span className="truncate max-w-[200px] text-slate-400">
            {game.history().length > 0 ? `آخر نقلة: ${game.history()[game.history().length - 1]}` : 'بداية المباراة'}
          </span>
        </div>
      </main>

      {/* Pawn Promotion Modal */}
      {promotionPending && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-xs w-full shadow-2xl text-center">
            <h3 className="text-sm font-bold text-white mb-3">اختر قطعة الترقية (Pawn Promotion)</h3>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((type) => (
                <button
                  key={type}
                  onClick={() => executeMove(promotionPending.from, promotionPending.to, type)}
                  className="aspect-square bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl p-2 flex items-center justify-center transition"
                >
                  <ChessPiece type={type} color={promotionPending.color} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm New Game Dialog */}
      {confirmNewGame && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">بدء لعبة جديدة؟</h3>
            <p className="text-xs text-slate-400 mb-4">سيتم إعادة ضبط الرقعة والبدء من جديد.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmNewGame(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleNewGame}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
