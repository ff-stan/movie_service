//引入数据库的链接模块
var mongoose = require('../common/db')
//数据库的数据集
var comment = new mongoose.Schema({
    movie_id:String,
    username:String,
    context:String,
    commentNumSuppose : Number,
    check:Boolean
})

var commentModel = mongoose.model('comment',comment)
module.exports = commentModel