import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

import type { Difficulty, GameState } from './types';
import { createInitialGameState, applyMove, applyPass } from './game/engine';
import { buildInitialState } from './game/initialPlacement';
import { chooseMove } from './game/ai';
import { MapView } from './map/MapView';
import { GameInfo } from './components/GameInfo';
import { GameControls } from './components/GameControls';
import { ResultModal } from './components/ResultModal';
import { RulesModal } from './components/RulesModal';

const HUMAN_COLOR = 'black' as const;
const CPU_COLOR = 'white' as const;
const CPU_DELAY_MS = 500 + Math.random() * 500;

function initGame(): GameState {
  const base = createInitialGameState();
  return buildInitialState(base);
}

export const App = () => {
  const [gameState, setGameState] = useState<GameState>(initGame);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const difficultyRef = useRef<Difficulty>(difficulty);

  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const showPassMessage = useCallback((msg: string) => {
    setPassMessage(msg);
    if (passMessageTimerRef.current) clearTimeout(passMessageTimerRef.current);
    passMessageTimerRef.current = setTimeout(() => setPassMessage(null), 3000);
  }, []);

  const handleRestart = useCallback(() => {
    if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
    setPassMessage(null);
    setGameState(initGame());
  }, []);

  const handleCellClick = useCallback((name: string) => {
    setGameState((prev) => {
      if (prev.isGameOver) return prev;
      if (prev.currentTurn !== HUMAN_COLOR) return prev;
      if (!prev.legalMoves.has(name)) return prev;
      return applyMove(prev, name);
    });
  }, []);

  // CPU ターンの処理
  useEffect(() => {
    if (gameState.isGameOver) return;
    if (gameState.currentTurn !== CPU_COLOR) return;

    cpuTimerRef.current = setTimeout(() => {
      setGameState((prev) => {
        if (prev.isGameOver || prev.currentTurn !== CPU_COLOR) return prev;

        if (prev.legalMoves.size === 0) {
          showPassMessage('CPU: 合法手がありません。パスします。');
          const next = applyPass(prev);
          // 人間にも合法手がない場合はゲーム終了済み
          if (!next.isGameOver && next.legalMoves.size === 0) {
            showPassMessage('合法手がありません。パスします。');
            return applyPass(next);
          }
          return next;
        }

        const move = chooseMove(prev, difficultyRef.current);
        if (!move) return prev;
        return applyMove(prev, move);
      });
    }, CPU_DELAY_MS);

    return () => {
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
    };
  }, [gameState.currentTurn, gameState.isGameOver, showPassMessage]);

  // 人間ターンで合法手がないときのパス処理
  useEffect(() => {
    if (gameState.isGameOver) return;
    if (gameState.currentTurn !== HUMAN_COLOR) return;
    if (gameState.legalMoves.size > 0) return;

    showPassMessage('合法手がありません。パスします。');
    const timer = setTimeout(() => {
      setGameState((prev) => {
        if (prev.currentTurn !== HUMAN_COLOR || prev.legalMoves.size > 0 || prev.isGameOver) return prev;
        return applyPass(prev);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [gameState.currentTurn, gameState.legalMoves, gameState.isGameOver, showPassMessage]);

  const isCpuTurn = gameState.currentTurn === CPU_COLOR && !gameState.isGameOver;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: '0.05em' }}>
            Chiversi
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {' '}— 千葉県行政区域オセロ
            </Box>
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <MapView
          gameState={gameState}
          onCellClick={handleCellClick}
          disabled={isCpuTurn || gameState.isGameOver}
        />
      </Box>

      <Box
        component="footer"
        sx={{
          px: 2,
          py: 1,
          bgcolor: '#f5f5f5',
          borderTop: '1px solid #ddd',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
        }}
      >
        {gameState.isGameOver ? (
          <ResultModal gameState={gameState} onRestart={handleRestart} onShowRules={() => setRulesOpen(true)} />
        ) : (
          <>
            <GameInfo gameState={gameState} passMessage={passMessage} />
            <Box sx={{ ml: { sm: 'auto' } }}>
              <GameControls
                onRestart={handleRestart}
                onShowRules={() => setRulesOpen(true)}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
              />
            </Box>
          </>
        )}
      </Box>

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </Box>
  );
};
