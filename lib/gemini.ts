const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function getGeminiMove(game: any, apiKey: string): Promise<string | null> {
  const fen = game.fen();
  const legalMoves = game.moves({ verbose: true });
  const prompt = `You are a chess engine. Given the following chess position in FEN notation, suggest the best move for the side to play. Only return the move in UCI notation (e.g., "e2e4", "g8f6"). The move must be one of the following legal moves: ${legalMoves.map(m => m.from + m.to).join(', ')}. FEN: ${fen}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    const move = data.candidates[0].content.parts[0].text.trim();
    
    // Validate the move
    const isValidMove = legalMoves.some(m => m.from + m.to === move);
    return isValidMove ? move : null;
  } catch (error) {
    console.error('Error getting move from Gemini:', error);
    return null;
  }
}