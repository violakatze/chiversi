import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import type { GameState } from '../types';

type Props = {
  gameState: GameState;
  onRestart: () => void;
};

export const ResultModal = ({ gameState, onRestart }: Props) => {
  const { isGameOver, winner, blackCount, whiteCount } = gameState;

  const title =
    winner === 'draw' ? '引き分け！' :
    winner === 'black' ? 'あなたの勝ち！' :
    'CPUの勝ち！';

  return (
    <Dialog open={isGameOver} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="h6">
            最終スコア
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            黒（あなた）: <strong>{blackCount}</strong> 市区町村
          </Typography>
          <Typography variant="body1">
            白（CPU）: <strong>{whiteCount}</strong> 市区町村
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button variant="contained" onClick={onRestart}>
          もう一度遊ぶ
        </Button>
      </DialogActions>
    </Dialog>
  );
};
