require('../../config/database.js');
var bcrypt   = require('bcrypt-nodejs');
var knex = require('knex')({
  client: 'mysql',
  connection: {
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'shoutcart',
		charset  : 'utf8'
  }
});
var bookshelf = require('bookshelf')(knex);
var User = bookshelf.Model.extend({
  tableName: 'users'
});


module.exports = User;