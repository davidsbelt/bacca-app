'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
*  Media Schema
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
		//location of the file;
    type: String,
    default: ''
  }
});

var TagSchema = new Schema({
  text: {
    type: String,
    required: 'Please provide at least one tag'
  }
});

/**
 * Reply Schema
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
  blocked: {
    type: Boolean,
    default: false,
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
 * Comment Schema
 */

var CommentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    default: '',
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  replies: [ReplySchema]
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
  headerImageURL: {
    type: String,
    default: '',
    trim: true
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  intro: {
    type: String,
    default: '',
    trim: true,
    required: 'Intro cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'Content cannot be blank'
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
  comments: [CommentSchema],
  likes: {
    type: Number,
    default: 0
  },
  tags: [TagSchema]
});

//index for text search
ArticleSchema.index({ content: 'text',title: 'text' },{ weights: { title: 4,content: 2 } });

// Generate the slug
ArticleSchema.pre('save',function (next) {
  this.slug = sluger(this.title);
  next();
});

// virtual to use as the url in querries
ArticleSchema.virtual('url').get(function() {
  return this.slug + '/' + this._id;
});

// function to turn article title into readable slug for url

function sluger(text) {
  var slug = text.toString().toLowerCase()
  .replace(/\s+/g,'-')        // Replace spaces with -
  .replace(/[^\w\-]+/g,'')   // Remove all non-word chars
  .replace(/\-\-+/g,'-')      // Replace multiple - with single -
  .replace(/^-+/,'')          // Trim - from start of text
  .replace(/-+$/,'');         // Trim - from end of text
  return slug;
}

mongoose.model('Article',ArticleSchema);
mongoose.model('Comment',CommentSchema);
mongoose.model('Reply',ReplySchema);
mongoose.model('Tag',TagSchema);
