'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * media Schema
 */ 


var MediaSchema = new Schema({
    //schema is tailored for file hosting on cloudinary platform
  public_id: {
    type: String,
    default: ''
  },
  url: {
    //location of the file 
    type: String, 
    default: ''
  },
  secure_url: {
    //location of the file 
    type: String, 
    default: ''
  }
});

  

/**
 * reply Schema
 */  
var ReplySchema = new Schema({
  
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'content cannot be blank'
  },
  parent: {
    type: Schema.ObjectId
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * comment Schema
 */  

var CommentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    default: '',
    required: 'content cannot be blank',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  reply: [ReplySchema]
});

/**
 * Article Schema
 */

var ArticleSchema = new Schema({
  media: [MediaSchema],  

  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'content cannot be blank'
  },
  slug: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  comments:[CommentSchema]
});

// Generate the slug
ArticleSchema.pre('save', function (next) {
  this.slug = sluger(this.title);
  next(); 
});


// virtual to use as the url in querries
ArticleSchema.virtual('url').get(function() {
    
  return this.slug + '/' + this._id;
    
});

// function to turn article title into readable slug for url

function sluger(text) {

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

mongoose.model('Article', ArticleSchema);
