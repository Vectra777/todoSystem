module.exports = (app) => {
    const file = require('../controllers/file.controller.js');
    const router = require('express').Router();
    const { authenticateJWT } = require('../authentication/utils.js');

    // List files (optionally filtered by competenceId query param)
    router.get('/', authenticateJWT, file.findAll);

    // Upload a file (requires authentication)
    router.post('/', authenticateJWT, file.uploadMiddleware, file.upload);

    // Download a file by ID (requires authentication)
    router.get('/:id/download', authenticateJWT, file.download);

    // Delete a file by ID (requires authentication + authorization in controller)
    router.delete('/:id', authenticateJWT, file.delete);

    app.use('/api/file', router);
}