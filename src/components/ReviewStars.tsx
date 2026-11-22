import { Rating, Box, Typography } from '@mui/material';
import { colors } from '../theme';

interface ReviewStarsProps {
  rating?: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

const ReviewStars = ({ rating, reviewCount = 0, size = 'small', showCount = true }: ReviewStarsProps) => {
  if (!rating || reviewCount === 0) {
    return showCount ? (
      <Typography variant="caption" sx={{ color: colors.muted }}>Chưa có đánh giá</Typography>
    ) : null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Rating
        value={rating}
        precision={0.1}
        readOnly
        size={size}
        sx={{ color: colors.camel, '& .MuiRating-iconEmpty': { color: colors.border } }}
      />
      {showCount && (
        <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
          {rating.toFixed(1)} ({reviewCount})
        </Typography>
      )}
    </Box>
  );
};

export default ReviewStars;
