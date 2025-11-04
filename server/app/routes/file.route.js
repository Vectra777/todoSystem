module.exports = (app) => {
    const file = require('../controllers/file.controller.js');
    const router = require('express').Router();

    router.get('/', file.findAll);

    app.use('/api/file', router);
}