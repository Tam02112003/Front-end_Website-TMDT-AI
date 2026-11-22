import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel } from '@mui/material';
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
      setError('Không tải được danh sách người dùng.');
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
    if (window.confirm('Xóa người dùng này?')) {
      try {
        await UserService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Xóa người dùng thất bại.');
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
        setError('Cập nhật người dùng thất bại.');
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

  const handleRoleChange = (e: SelectChangeEvent) => {
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
        Quản lý người dùng
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_admin ? 'Có' : 'Không'}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(user)} sx={{ mr: 1 }}>
                    Sửa
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleDeleteClick(user.id)} sx={{ borderColor: 'error.main', color: 'error.main' }}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Sửa người dùng</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
              <TextField
                margin="dense"
                name="username"
                label="Tên đăng nhập"
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
              <FormControl fullWidth variant="standard" sx={{ m: 1 }}>
                <InputLabel id="is_admin-label">Quyền Admin</InputLabel>
                <Select
                  labelId="is_admin-label"
                  id="is_admin"
                  name="is_admin"
                  value={currentUser.is_admin ? 'true' : 'false'}
                  onChange={handleRoleChange}
                  label="Quyền Admin"
                >
                  <MenuItem value="true">Có</MenuItem>
                  <MenuItem value="false">Không</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button onClick={handleSaveUser} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserPage;