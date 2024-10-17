"use client"

import { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Button } from "@/components/ui/button"
import { getGeminiMove } from '@/lib/gemini';

interface ChessGameProps {
  apiKey: string;
}

export function ChessGame({ apiKey }: ChessGameProps) {
  const [game, setGame] = useState(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  const makeAMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result;
  }, [game]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (game.turn() !== 'w') return false; // Only allow moves when it's white's turn
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (move === null) return false;
    setTimeout(makeGeminiMove, 200);
    return true;
  };

  const makeGeminiMove = useCallback(async () => {
    if (game.turn() !== 'b') return; // Only make Gemini move when it's black's turn
    setIsThinking(true);
    const geminiMove = await getGeminiMove(game, apiKey);
    if (geminiMove) {
      const from = geminiMove.slice(0, 2);
      const to = geminiMove.slice(2, 4);
      const promotion = geminiMove.length > 4 ? geminiMove[4] : undefined;
      makeAMove({ from, to, promotion });
    } else {
      console.error('Gemini returned an invalid move');
      // Fallback to a random legal move
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        makeAMove({ from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion });
      }
    }
    setIsThinking(false);
  }, [game, apiKey, makeAMove]);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      makeGeminiMove();
    }
  }, [game, makeGeminiMove]);

  const resetGame = () => {
    setGame(new Chess());
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation="white"
      />
      <div className="space-x-4">
        <Button onClick={resetGame}>New Game</Button>
      </div>
      {isThinking && <p>Gemini is thinking...</p>}
      {game.isGameOver() && <p>Game Over! {game.isCheckmate() ? `${game.turn() === 'w' ? 'Black' : 'White'} wins!` : 'Draw!'}</p>}
    </div>
  );
}