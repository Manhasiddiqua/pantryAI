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
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fbffe6',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: 8, // Add borderRadius to round edges
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState({ name: '', quantity: 0 })

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
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

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleEditOpen = (name, quantity) => {
    setEditItem({ name, quantity })
    setEditOpen(true)
  }

  const handleEditClose = () => {
    setEditOpen(false)
  }

  const handleUpdateItem = async () => {
    const { name, quantity } = editItem
    if (name.trim() === '' || quantity < 0) {
      alert('Please provide valid inputs')
      return
    }

    // Get the original item from inventory to check if name changed
    const originalItem = inventory.find(item => item.name === editItem.name)

    if (originalItem && originalItem.name !== name) {
      // Delete the original item if the name is changed
      await deleteDoc(doc(collection(firestore, 'inventory'), originalItem.name))
    }

    // Update or create the item with the new data
    await setDoc(doc(collection(firestore, 'inventory'), name), { quantity })

    await updateInventory()
    handleEditClose()
  }

  const filteredInventory = inventory.filter(({ name }) => {
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Typography variant="h1" mb={3} sx={{ fontWeight: 'bold' }}>
        Inventory Tracker
      </Typography>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
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

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={style}>
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Edit Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={editItem.name}
  
                />
                <TextField
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={editItem.quantity}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      quantity: parseInt(e.target.value, 10),
                    })
                  }
                />
                <Button variant="outlined" onClick={handleUpdateItem} sx={{
                  color: 'white',
                        bgcolor: '#ce4583',
                        '&:hover': {
                          bgcolor: '#3f4250',
                        }, 
                      }}>
                  Save Changes
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              bgcolor: '#ce4583',
              '&:hover': {
                bgcolor: '#3f4250',
              },
            }}
          >
            Add New Item
          </Button>

          {/* Search Bar */}
          <TextField
            id="search-bar"
            label="Search Items"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 800, mb: 2 }} // Limit width and add margin-bottom
          />

          <Box border={'1px solid #333'} sx={{ borderRadius: 3 }}>
            <Box
              width="800px"
              height="100px"
              sx={{
                bgcolor: '#ce4583',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTopLeftRadius: 12, // Use sx to round the top-left corner
                borderTopRightRadius: 12, // Use sx to round the top-right corner
              }}
            >
              <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow={'scroll'}>
              {filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="150px"
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  bgcolor={'#ffdaeb'}
                  paddingX={5}
                  sx={{ borderRadius: 3 }}
                >
                  <Box textAlign="center">
                    <Typography
                      variant={'h4'}
                      color={'#333'}
                      sx={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography
                      variant={'body1'}
                      color={'#555'}
                      sx={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Quantity: <strong>{quantity}</strong>
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(name)}
                      sx={{
                        bgcolor: '#ce4583',
                        '&:hover': {
                          bgcolor: '#3f4250',
                        },
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => addItem(name)}
                      sx={{
                        bgcolor: '#ce4583',
                        '&:hover': {
                          bgcolor: '#3f4250',
                        },
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleEditOpen(name, quantity)}
                      sx={{
                        bgcolor: '#ce4583',
                        '&:hover': {
                          bgcolor: '#3f4250',
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )
    }
