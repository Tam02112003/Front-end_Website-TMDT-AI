import React, { memo } from 'react';
import { Typography, Box, CircularProgress, Button, TextField, ListItem, ListItemText, Avatar } from '@mui/material';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment & { children?: Comment[] };
  level: number;
  productId: string;
  isLoggedIn: boolean;
  user: { username: string; is_admin: boolean } | null;
  editingCommentId: number | null;
  editingCommentContent: string;
  replyingToCommentId: number | null;
  replyContent: string;
  setEditingCommentId: (id: number | null) => void;
  setEditingCommentContent: (content: string) => void;
  handleSaveEditedComment: (commentId: number) => Promise<void>;
  handleCancelEdit: () => void;
  handleDeleteComment: (commentId: number) => Promise<void>;
  setReplyingToCommentId: (id: number | null) => void;
  setReplyContent: (content: string) => void;
  handlePostComment: (parentId: number | null) => Promise<void>;
  commentLoading: boolean;
}

const CommentItem: React.FC<CommentItemProps> = memo(({
  comment,
  level,
  productId,
  isLoggedIn,
  user,
  editingCommentId,
  editingCommentContent,
  replyingToCommentId,
  replyContent,
  setEditingCommentId,
  setEditingCommentContent,
  handleSaveEditedComment,
  handleCancelEdit,
  handleDeleteComment,
  setReplyingToCommentId,
  setReplyContent,
  handlePostComment,
  commentLoading,
}) => {
  const isReplying = replyingToCommentId === comment.id;

  return (
    <Box sx={{ ml: level * 4, mt: 2 }}>
      <ListItem alignItems="flex-start" sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 2, boxShadow: 1 }}>
        {editingCommentId === comment.id ? (
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editingCommentContent}
              onChange={(e) => setEditingCommentContent(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleSaveEditedComment(comment.id)}
              disabled={commentLoading || !editingCommentContent.trim()}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button variant="outlined" color="secondary" size="small" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </Box>
        ) : (
          <>
            <Avatar src={comment.user_avatar_url} sx={{ mr: 2 }} />
            <ListItemText
              primary={
                <Typography component="span" variant="subtitle1" color="text.primary">
                  {comment.user_name || 'Anonymous'}
                </Typography>
              }
              secondary={
                <Typography component="span" variant="body2" color="text.secondary" display="block">
                  {new Date(comment.created_at).toLocaleDateString()} - {comment.content}
                  <Box sx={{ mt: 1 }}>
                    {isLoggedIn && editingCommentId !== comment.id && (
                      <Button size="small" onClick={() => setReplyingToCommentId(comment.id)}>
                        Reply
                      </Button>
                    )}
                    {isLoggedIn && (user?.username === comment.user_name || user?.is_admin) && editingCommentId !== comment.id && (
                      <>
                        <Button size="small" onClick={() => setEditingCommentId(comment.id)} sx={{ ml: 1 }}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteComment(comment.id)} sx={{ ml: 1 }}>
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </Typography>
              }
            />
          </>
        )}
      </ListItem>
      {isReplying && isLoggedIn && (
        <Box sx={{ ml: level * 4 + 4, mt: 2 }}>
          <TextField
            label="Your Reply"
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 1 }}
            disabled={commentLoading}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handlePostComment(comment.id)}
            disabled={commentLoading || !replyContent.trim()}
            sx={{ mr: 1 }}
          >
            {commentLoading ? <CircularProgress size={20} /> : 'Post Reply'}
          </Button>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setReplyingToCommentId(null)}>
            Cancel
          </Button>
        </Box>
      )}
      {comment.children && comment.children.map(childComment => (
        <CommentItem
          key={childComment.id}
          comment={childComment}
          level={level + 1}
          productId={productId}
          isLoggedIn={isLoggedIn}
          user={user}
          editingCommentId={editingCommentId}
          editingCommentContent={editingCommentContent}
          replyingToCommentId={replyingToCommentId}
          replyContent={replyContent}
          setEditingCommentId={setEditingCommentId}
          setEditingCommentContent={setEditingCommentContent}
          handleSaveEditedComment={handleSaveEditedComment}
          handleCancelEdit={handleCancelEdit}
          handleDeleteComment={handleDeleteComment}
          setReplyingToCommentId={setReplyingToCommentId}
          setReplyContent={setReplyContent}
          handlePostComment={handlePostComment}
          commentLoading={commentLoading}
        />
      ))}
    </Box>
  );
});

export default CommentItem;
