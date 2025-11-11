module.exports = (app) => {
    const file = require('../controllers/file.controller.js');
    const router = require('express').Router();
    const { ensureGetAllowed } = require('../authentication/utils.js');

    router.get('/', ensureGetAllowed, file.findAll);

    app.use('/api/file', router);
}