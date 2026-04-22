import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const RulesModal = ({ open, onClose }: Props) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 'bold' }}>ルール説明 — Chiversi（チバーシ）</DialogTitle>
    <DialogContent dividers>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        基本ルール
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="千葉県の各市区町村が1マスです。黒（あなた）と白（CPU）が交互に石を置きます。" />
        </ListItem>
        <ListItem>
          <ListItemText primary="石を置いて相手の石を挟むと、挟まれた石がすべて自分の色に変わります。" />
        </ListItem>
        <ListItem>
          <ListItemText primary="挟める手がない場合はパスになります。両者ともパスになるか全マスが埋まったらゲーム終了です。" />
        </ListItem>
        <ListItem>
          <ListItemText primary="石の多い方が勝ちです。" />
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        挟み判定について
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="各市区町村の重心座標を使って「方向」を定義します。8方向（東・西・南・北・斜め4方向）に走査し、隣接する市区町村を辿って挟み判定を行います。" />
        </ListItem>
        <ListItem>
          <ListItemText primary="隣接していないマスへの飛び越しはできません。" />
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        戦略のヒント
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="浦安市・館山市など隣接が少ない市区町村は「角」に相当し、取られにくい重要地点です。" />
        </ListItem>
        <ListItem>
          <ListItemText primary="市原市など隣接が多い市区町村は、序盤に取ると危険です。" />
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" color="text.secondary">
        出典: 国土交通省国土政策局『国土数値情報（行政区域データ）』(CC BY 4.0)
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">閉じる</Button>
    </DialogActions>
  </Dialog>
);
