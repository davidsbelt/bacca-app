'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  cloudinary = require('cloudinary'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');

cloudinary.config({
  cloud_name: 'do3pqi4vn',
  api_key: '639462783247274',
  api_secret: 'AnAy5EwyWZibrZkHU3P1G1zxUrw'
});

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  if (user) {
    var options = config.uploads.profileUpload;
    options.dest = options.dest + user.username;

    var upload = multer(options).single('newProfilePicture');

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;
    upload(req, res, function (uploadError) {

      console.log(req.file);

      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else if (req.file === undefined) {
        return res.status(400).send({
          message: 'Error - profile picture did not upload'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + '/' + req.file.filename;

        cloudinary.uploader.upload(req.file.path, function(result) {
          user.profileCloudImageURL = {
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url
          };
        }, {
          folder: 'users/' + user.username
        });

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
