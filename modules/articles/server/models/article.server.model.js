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
    //remote location of the file
    type: String,
    default: ''
  },
  secure_url: {
		// remote location of the file via HTTPS;
    type: String,
    default: ''
  },
  local_src: {
    // local src file
    type: String,
    default: ''
  },
  caption: {
    // caption / alt text for media file
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
    default: false
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
 * CommentBlock Schema
 */

var CommentBlockSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Like Schema
 */

var LikeSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
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
    default: ''
  },
  blocked: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  replies: [ReplySchema],
  blockers: [CommentBlockSchema],
  likes: [LikeSchema]
});

/**
 * Article Schema
 */

var ArticleSchema = new Schema({
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
  headerMedia: MediaSchema,
  media: [MediaSchema],
  comments: [CommentSchema],
  likes: [LikeSchema],
  tags: [TagSchema]
});

//index for text search
ArticleSchema.index({
  content: 'text',
  intro: 'text',
  title: 'text'
},{
  weights: {
    content: 2,
    intro: 4,
    title: 8
  }
});

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
mongoose.model('Media',MediaSchema);
