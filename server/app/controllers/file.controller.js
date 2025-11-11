const db = require('../models');
const { ensureAuthenticated } = require('../authentication/utils');
const File = db.files;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        // Ensure uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: timestamp + random + sanitized original name
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitized}`;
        cb(null, unique);
    }
});

// File filter: validate mime types and extensions
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
        // Videos
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv',
        'video/webm', 'video/ogg', 'video/3gpp', 'video/x-flv', 'video/x-matroska',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        // Archives
        'application/zip',
        'application/x-zip-compressed'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024 // 200 MB max
    }
});

exports.uploadMiddleware = upload.single('file');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        const { competence_id } = req.body;
        if (!competence_id) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'competence_id is required' });
        }

        // Check if competence exists
        const competence = await db.competences.findByPk(competence_id);
        if (!competence) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Competence not found' });
        }

        // Get uploader ID from token
        const uploadedBy = req.user?.id || null;

        // Save file metadata to database
        const fileRecord = await File.create({
            competence_id: competence_id,
            name: req.file.originalname,
            original_name: req.file.originalname,
            stored_name: req.file.filename,
            extension: path.extname(req.file.originalname).substring(1),
            mime_type: req.file.mimetype,
            size: req.file.size,
            uploaded_by: uploadedBy
        });

        res.status(201).json({
            id: fileRecord.id,
            name: fileRecord.original_name,
            size: fileRecord.size,
            mime_type: fileRecord.mime_type,
            created_at: fileRecord.created_at,
            uploaded_by: fileRecord.uploaded_by
        });
    } catch (err) {
        // Clean up file if DB save fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            message: err.message || 'Error uploading file'
        });
    }
};

exports.download = async (req, res) => {
    try {
        const fileRecord = await File.findByPk(req.params.id);
        if (!fileRecord) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '../../uploads', fileRecord.stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on disk' });
        }

        // Set headers for download
        res.setHeader('Content-Type', fileRecord.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.original_name}"`);
        res.setHeader('Content-Length', fileRecord.size);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Error downloading file'
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const fileRecord = await File.findByPk(req.params.id);
        if (!fileRecord) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Authorization: only HR/admin or uploader can delete
        const userRole = (req.user?.role || '').toLowerCase();
        const isHrOrAdmin = userRole === 'hr' || userRole === 'admin';
        const isUploader = req.user?.id === fileRecord.uploaded_by;

        if (!isHrOrAdmin && !isUploader) {
            return res.status(403).json({ message: 'Forbidden: you cannot delete this file' });
        }

        // Delete from filesystem
        const filePath = path.join(__dirname, '../../uploads', fileRecord.stored_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await fileRecord.destroy();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Error deleting file'
        });
    }
};

exports.findAll = async (req, res) => {
    const decoded = ensureAuthenticated(req, res);
    if (!decoded) return;

    const competenceId = req.query.competenceId || req.query.competence_id;
    const role = (req.user?.role || '').toString().toLowerCase();
    const isHrOrAdmin = role === 'hr' || role === 'admin';

    if (!isHrOrAdmin) {
        if (!competenceId) {
            return res.status(400).json({ message: 'competenceId query parameter is required' });
        }

        const assignment = await db.user_tasks.findOne({
            where: {
                competence_id: competenceId,
                employee_id: decoded.id
            }
        });

        if (!assignment) {
            return res.status(403).json({ message: 'Forbidden: you are not assigned to this competence' });
        }
    }

    const options = {};
    if (competenceId) {
        options.where = { competence_id: competenceId };
    }

    try {
        const files = await File.findAll(options);
        return res.json(files);
    } catch (err) {
        return res.status(500).json({
            message: err.message || 'Some error occurred while retrieving files.'
        });
    }
};