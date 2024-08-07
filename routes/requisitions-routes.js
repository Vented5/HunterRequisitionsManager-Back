const express = require('express')
const router = express.Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.use(express.json());

//router.use(express.urlencoded());

router.post('/', async (req, res) => {
    console.log("req.body: " , req.body)
    
    const newItems = req.body.itemLists
    console.log("newItems: ", newItems)
    
    let total = 0

    const newRequest = await prisma.requisitons.create({
        data: {
            total: 0,
            requisitorId: req.body.requestor,
            description: req.body.description,
            dueDate: new Date(req.body.dueDate).toISOString(),
            justification: req.body.justification,
            providerId: 1,
            department: req.body.department,
        }
    })

    newItems.map(async (item) => {
        total = total + (item.price * item.quantity)
        const createdItem = await prisma.items.create({
            data: {
                name: item.name,
                price: item.price,
                category: item.category,
                quantity: item.quantity,
                requisitionId: newRequest.id,
            }
        })
    })

    await prisma.requisitons.update({
        where: { id: newRequest.id },
        data: {
            total: total
        }

    })

    const createdRequest = await prisma.requisitons.findUnique({
        where: { id: newRequest.id },
        include: {
            requisitor: {
                select: {
                    name: true
                }
            },
            provider: {
                select: {
                    name: true
                }
            },
        }
    })

    
        
    

    console.log("newRequest: ", newRequest)
    res.status(200).json({ requisition: createdRequest, message: 'Requisision creada con exito' })
    
    
})


router.get('/', async (req, res) => {
    const requisitions = await prisma.requisitons.findMany({
        include: {
            requisitor: {
                select: {
                    name: true
                }
            },
            /*department: {
                select: {
                    name: true
                }
            },*/
            provider: {
                select: {
                    name: true
                }
            },
            validator: {
                select: {
                    name: true,
                    role: true
                }
            }
        }
    })
    await prisma.$disconnect()
    res.send(requisitions)
})

router.get('/validate', async (req, res) => {
    const requisitions = await prisma.requisitons.findMany({
        where: {
            status: 'requested'
        },
        include: {
            requisitor: {
                select: {
                    name: true
                }
            },
            /*department: {
                select: {
                    name: true
                }
            },*/
            provider: {
                select: {
                    name: true
                }
            },
        }
    })
    await prisma.$disconnect()
    res.send(requisitions)
})


router.get('/:id', async (req, res) => {
    const requisition = await prisma.requisitons.findUnique({
        where: {
            id: parseInt(req.params.id)
        }
    })
    await prisma.$disconnect()
    res.send(requisition)
})


router.patch('/:id', async (req, res) => {
    console.log("req.body", req.body)
    const selectedRequest = req.body
    /*await prisma.requisitons.findUnique({
        where: {
            id: parseInt(req.params.id)
        }
    })*/

    try {
        await prisma.requisitons.update({
            where: {
                id: parseInt(req.params.id)
            }, data: {
                status: selectedRequest.status,
            }
        })
        if(selectedRequest.validatorId) {
            await prisma.requisitons.update({
                where: {
                    id: parseInt(req.params.id)
                }, data: {
                    validatorId: selectedRequest.validatorId 
                }
            })
        }
        
        res.status(200).send(selectedRequest)
    } catch(e) {
        console.log(e)
    }
})

module.exports = router