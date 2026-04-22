const router = require('express').Router();
const entityController = require('../controllers/entity.controller');

/**
 * @swagger
 * tags:
 *   name: Entities
 *   description: Endpoints públicos de entidades
 *
 * /entities/{id}/qr:
 *   get:
 *     summary: Obtener QR público de la entidad
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Imagen PNG del QR
 */
router.get('/:id/qr', entityController.getEntityQR);

module.exports = router;
