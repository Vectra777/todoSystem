const db = require('../models');
const File = db.files;

exports.findAll = (req, res) => {
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