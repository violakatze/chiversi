import { Box, Typography, Button, Chip } from '@mui/material';
import type { GameState } from '../types';

type Props = {
  gameState: GameState;
  onRestart: () => void;
  onShowRules: () => void;
};

export const ResultModal = ({ gameState, onRestart, onShowRules }: Props) => {
  const { isGameOver, winner, blackCount, whiteCount } = gameState;
  if (!isGameOver) return null;

  const label =
    winner === 'draw' ? '引き分け！' :
    winner === 'black' ? 'あなたの勝ち！' :
    'CPUの勝ち！';

  const chipColor =
    winner === 'black' ? 'success' :
    winner === 'white' ? 'error' :
    'default';

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={label} color={chipColor} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
        <Typography variant="body2">
          最終スコア — 黒（あなた）: <strong>{blackCount}</strong> / 白（CPU）: <strong>{whiteCount}</strong>
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, ml: { sm: 'auto' } }}>
        <Button variant="outlined" size="small" onClick={onShowRules}>
          ルール説明
        </Button>
        <Button variant="contained" size="small" onClick={onRestart}>
          もう一度遊ぶ
        </Button>
      </Box>
    </Box>
  );
};
