'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  where,
} from 'firebase/firestore'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
   Checkbox, Toolbar, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from "./Navbar"

const style = {
  // position: 'absolute',
  // top: '50%',
  // left: '50%',
  // transform: 'translate(-50%, -50%)',
  // width: 400,
  bgcolor: 'white',
  // border: '2px solid #000',
  // boxShadow: 24,
  // p: 4,
  // display: 'flex',
  // flexDirection: 'column',
  // gap: 3,
}

export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([]);

  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const handleClick = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = inventory.map((item) => item.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleDeleteSelected = async () => {
    // Add your logic for deleting selected items from Firestore here
    console.log('Deleting selected items:', selected);
    for (const item of selected) {
      await removeItem(item);
    }
    setSelected([]); // Clear selection after deletion
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
      <Box sx={{ height: '100vh' }}>
      <Navbar/>

      <Box
       width="100vw"
    height="50vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
      >
        <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={6}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>
    {/* <Button variant="contained" onClick={handleOpen}>
      Add New Item
    </Button> */}
    <Paper sx={{ width: '80%', mt: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {/* <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Inventory
          </Typography> */}
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: '0 0 70%' }}
          />
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
          {selected.length > 0 && (
            <IconButton onClick={handleDeleteSelected}>
              <DeleteIcon />
            </IconButton>
          )}
        </Toolbar>
      <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
          <TableCell padding="checkbox" sx={{ bgcolor: 'lightgray' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < inventory.length}
                    checked={inventory.length > 0 && selected.length === inventory.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'lightgray' }}>Products</TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'lightgray' }}>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
              {filteredInventory.map(({ name, quantity }) => {
                const isItemSelected = isSelected(name);
                return (
                  <TableRow
                    hover
                    onClick={() => handleClick(name)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={name}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{quantity}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
      </Table>
    </TableContainer>
    </Paper>
    </Box>
    </Box> 
);

}