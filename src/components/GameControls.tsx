import { Button, Stack } from '@mui/material';

type Props = {
  onRestart: () => void;
  onShowRules: () => void;
};

export const GameControls = ({ onRestart, onShowRules }: Props) => (
  <Stack direction="row" spacing={1}>
    <Button variant="outlined" size="small" onClick={onRestart}>
      リスタート
    </Button>
    <Button variant="outlined" size="small" onClick={onShowRules}>
      ルール説明
    </Button>
  </Stack>
);
