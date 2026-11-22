import { Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Review } from '../types';
import ReviewStars from './ReviewStars';
import { colors } from '../theme';

interface ReviewItemProps {
  review: Review;
  canManage: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
}

const ReviewItem = ({ review, canManage, onEdit, onDelete }: ReviewItemProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 2.5, borderBottom: `1px solid ${colors.border}` }}>
      <Avatar src={review.user_avatar_url} sx={{ bgcolor: colors.surfaceRaised, color: colors.jade }}>
        {review.username.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600 }}>{review.username}</Typography>
          {review.verified_purchase && (
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
              label="Đã mua hàng"
              size="small"
              sx={{ bgcolor: 'rgba(90, 196, 150, 0.12)', color: colors.jade, height: 22, '& .MuiChip-icon': { color: colors.jade } }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <ReviewStars rating={review.rating} reviewCount={1} showCount={false} />
          <Typography variant="caption" sx={{ color: colors.muted }}>
            {new Date(review.created_at).toLocaleDateString('vi-VN')}
          </Typography>
        </Box>
        {review.content && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', color: colors.ink }}>
            {review.content}
          </Typography>
        )}
        {canManage && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => onEdit(review)} sx={{ color: colors.muted, '&:hover': { color: colors.jade } }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(review.id)} sx={{ color: colors.muted, '&:hover': { color: colors.danger } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReviewItem;
