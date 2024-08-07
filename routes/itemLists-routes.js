const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.use(express.json());

// Busca las listas de una requisision en especifico
router.get('/:id', async (req, res) => {
    const itemsLists = await prisma.items.findMany({
        where: {
            requisitionId: parseInt(req.params.id) 
        },
    })
    res.status(200).json(itemsLists)
})

module.exports = router