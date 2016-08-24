'use strict';

const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const fse = require('fs-extra');

router.post('/files', function(req, res, next) {
    var isWindows = process.platform === 'win32';
    var trailingSlashRe = isWindows ? /[^:]\\$/ : /.\/$/;
    var dir = null;


    if (isWindows) {
        // path = process.env.TEMP || process.env.TMP || (process.env.SystemRoot || process.env.windir) + '\\temp';
        dir = process.env.APPDATA;
    } else {
        dir = process.env.HOME + '/Library/Preferences' || '/var/local';
    }

    if (trailingSlashRe.test(dir)) {
        dir = dir.slice(0, -1);
    }

    function existsSync(filePath) {
        if (!filePath) return false
        try {
            return fs.statSync(filePath).isFile()
        } catch (e) {
            return false
        }
    };

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            var newDir = dir + '/youproductive';
            mkdirp(newDir, function(err) {
                console.log('mkdirp err: ',err);
                console.log('mkdirp : ',newDir);
                cb(err, newDir);
            });
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var limits = { fileSize: 1024 * 1024 * 1024 };

    var fileFilter = function(req, file, cb) {
        if (req.query.type && req.query.type == 'user_photo') {
            if ((file.mimetype !== 'image/png') &&
                (file.mimetype !== 'image/jpeg') &&
                (file.mimetype !== 'image/jpg') &&
                (file.mimetype !== 'image/gif') &&
                (file.mimetype !== 'image/x-ms-bmp')) {
                req.fileValidationError = 'Invalid file type. Must be .png, .jpg, .jpeg, .gif, .bmp';
                return cb(null, false, new Error('Invalid file type. Must be .png, .jpg, .jpeg, .gif, .bmp'));
            }

            var filepath;
            console.log('req.body.isFileChange: ',req.body);
            if (req.body.isFileChange) {
                console.log('req.body.oldfile: ',req.body.oldfile);
                filepath = req.body.oldfile;
                console.log('filepath: ',filepath);
                if (existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            } else {
                filepath = dir + '/youproductive/' + file.originalname;
                if (existsSync(filepath)) {
                    req.fileValidationError = 'File already exist.';
                    return cb(null, false, new Error('File already exist.'));
                }
            }
        }

        cb(null, true);
    };

    var uploadImg = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: limits
    }).single('filefield');

    uploadImg(req, res, function(err) {
        if (err) {
            return res.status(500).json(err);
        }

        if (req.fileValidationError) {
            return res.status(400).send(req.fileValidationError);
        }

        var resp = {
            user_id: req.body.user_id,
            type: req.body.type,
            file: req.file.path,
            file_mime: req.file.mimetype,
            filename: req.file.originalname,
            isFileChange: req.body.isFileChange
        };
        switch (req.body.type) {
            case 'tasks':
                resp.task_id = req.body.task_id;
                break;
            case 'projects':
                resp.project_id = req.body.project_id;
            case 'organizations':
                resp.organization_id = req.body.organization_id;
                break;
            case 'comments':
                resp.comment_id = req.body.comment_id;
                break;
        }
        return res.status(200).json(resp);
    });
});

module.exports = router;