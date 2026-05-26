import express from 'express'
import Equipment from '../models/Equipment.js'
import RentalRequest from '../models/RentalRequest.js'

const router = express.Router()

// GET ALL EQUIPMENT
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({
      createdAt: -1,
    })

    res.json(equipment)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// GET MY LISTINGS
router.get('/my', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const equipment = await Equipment.find({
      ownerId: userId,
    }).sort({
      createdAt: -1,
    })

    res.json(equipment)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// CREATE EQUIPMENT
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      location,
      ratePerDay,
      contact,
    } = req.body

    const userId = req.headers['x-user-id']
    const userName = req.headers['x-user-name']

    const equipment = await Equipment.create({
      ownerName: userName || 'Unknown Owner',
      ownerId: userId,
      name,
      category,
      description,
      location,
      ratePerDay,
      contact,
      available: true,
    })

    res.status(201).json(equipment)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// TOGGLE AVAILABILITY
router.patch('/:id/availability', async (req, res) => {
  try {
    const equipment = await Equipment.findById(
      req.params.id
    )

    equipment.available = !equipment.available

    await equipment.save()

    res.json(equipment)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// DELETE EQUIPMENT
router.delete('/:id', async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id)

    res.json({
      message: 'Deleted successfully',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// GET INCOMING REQUESTS
router.get('/requests/incoming', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const requests = await RentalRequest.find({
      ownerId: userId,
    }).sort({
      createdAt: -1,
    })

    res.json(requests)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// GET OUTGOING REQUESTS
router.get('/requests/outgoing', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const requests = await RentalRequest.find({
      renterId: userId,
    }).sort({
      createdAt: -1,
    })

    res.json(requests)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// SEND REQUEST
router.post('/:id/request', async (req, res) => {
  try {
    const equipment = await Equipment.findById(
      req.params.id
    )

    const userId = req.headers['x-user-id']

    const {
      renterContact,
      fromDate,
      toDate,
      message,
    } = req.body

    const request = await RentalRequest.create({
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      ownerId: equipment.ownerId,
      ownerName: equipment.ownerName,
      renterId: userId,
      renterName: req.headers['x-user-name'] || 'Unknown Renter',
      renterContact,
      fromDate,
      toDate,
      message,
      status: 'pending',
    })

    res.status(201).json(request)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// UPDATE REQUEST STATUS
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const request =
      await RentalRequest.findById(req.params.id)

    request.status = req.body.status

    await request.save()

    res.json(request)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

export default router