import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem } from '@mui/material';
import UserService from '../services/UserService';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean; // Changed from role: string
}

const AdminUserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err);
      }
    }
  };

  const handleSaveUser = async () => {
    if (currentUser) {
      try {
        await UserService.updateUser(currentUser.id, {
          username: currentUser.username,
          email: currentUser.email,
          is_admin: currentUser.is_admin,
        });
        setOpenEditDialog(false);
        fetchUsers();
      } catch (err) {
        setError('Failed to update user.');
        console.error(err);
      }
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, [name]: value };
      }
      return null;
    });
  };

  const handleRoleChange = (e: SelectChangeEvent<boolean>) => {
    const { name, value } = e.target;
    setCurrentUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, [name]: value === 'true' }; // Convert string to boolean
      }
      return null;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleEditClick(user)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(user.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
              <TextField
                margin="dense"
                name="username"
                label="Username"
                type="text"
                fullWidth
                variant="standard"
                value={currentUser.username}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="standard"
                value={currentUser.email}
                onChange={handleInputChange}
              />
              <Select
                margin="dense"
                name="is_admin"
                label="Admin Role"
                fullWidth
                variant="standard"
                value={currentUser.is_admin ? 'true' : 'false'}
                onChange={handleRoleChange}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveUser}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserPage;