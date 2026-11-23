import { useState } from 'react';
import { IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

interface WishlistButtonProps {
  productId: number;
  size?: 'small' | 'medium';
}

const WishlistButton = ({ productId, size = 'medium' }: WishlistButtonProps) => {
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const wishlisted = isWishlisted(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginNotice(true);
      return;
    }
    toggleWishlist(productId);
  };

  return (
    <>
      <Tooltip title={wishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}>
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            bgcolor: 'rgba(22,24,28,0.6)',
            '&:hover': { bgcolor: 'rgba(22,24,28,0.85)' },
          }}
        >
          {wishlisted ? (
            <Favorite fontSize={size} sx={{ color: colors.danger }} />
          ) : (
            <FavoriteBorder fontSize={size} sx={{ color: colors.ink }} />
          )}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={showLoginNotice}
        autoHideDuration={3000}
        onClose={() => setShowLoginNotice(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setShowLoginNotice(false)}>
          Đăng nhập để lưu vào danh sách yêu thích.
        </Alert>
      </Snackbar>
    </>
  );
};

export default WishlistButton;
