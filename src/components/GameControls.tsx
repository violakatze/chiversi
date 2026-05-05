import { Button, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { Difficulty } from '../types';

type Props = {
  onRestart: () => void;
  onShowRules: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
};

const LABELS: Record<Difficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
};

export const GameControls = ({ onRestart, onShowRules, difficulty, onDifficultyChange }: Props) => (
  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
    <ToggleButtonGroup
      value={difficulty}
      exclusive
      onChange={(_, v: Difficulty | null) => { if (v !== null) onDifficultyChange(v); }}
      size="small"
    >
      {(Object.keys(LABELS) as Difficulty[]).map((d) => (
        <ToggleButton key={d} value={d} sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
          {LABELS[d]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    <Button variant="outlined" size="small" onClick={onRestart}>
      リスタート
    </Button>
    <Button variant="outlined" size="small" onClick={onShowRules}>
      ルール説明
    </Button>
  </Stack>
);
