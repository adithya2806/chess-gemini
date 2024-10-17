"use client"

import { useState } from 'react';
import { ChessGame } from '@/components/ChessGame';
import { ApiKeyForm } from '@/components/ApiKeyForm';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Chess with Gemini AI</h1>
      {!apiKey ? (
        <ApiKeyForm onSubmit={setApiKey} />
      ) : (
        <ChessGame apiKey={apiKey} />
      )}
    </div>
  );
}