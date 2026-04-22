import { Box, Typography, Chip } from '@mui/material';
import type { GameState } from '../types';

type Props = {
  gameState: GameState;
  passMessage: string | null;
};

export const GameInfo = ({ gameState, passMessage }: Props) => {
  const { currentTurn, blackCount, whiteCount, isGameOver } = gameState;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {!isGameOver && (
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          手番:{' '}
          <Chip
            label={currentTurn === 'black' ? '● 黒（あなた）' : '○ 白（CPU）'}
            size="small"
            sx={{
              bgcolor: currentTurn === 'black' ? '#333' : '#fff',
              color: currentTurn === 'black' ? '#fff' : '#333',
              border: '1px solid #999',
              fontWeight: 'bold',
            }}
          />
        </Typography>
      )}
      <Typography variant="body1">
        スコア: <strong>黒 {blackCount}</strong> - <strong>白 {whiteCount}</strong>
      </Typography>
      {passMessage && (
        <Chip label={passMessage} color="warning" size="small" />
      )}
    </Box>
  );
};
