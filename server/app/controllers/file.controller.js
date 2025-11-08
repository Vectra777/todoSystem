const db = require('../models');
const { ensureAuthenticated } = require('../authentication/utils');
const File = db.files;

exports.findAll = (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    File.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving files."
            });
        });
}