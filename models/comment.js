//引入数据库的链接模块
var mongoose = require('../common/db')
//数据库的数据集
var comment = new mongoose.Schema({
    movie_id:String,
	movieName : String,
    username:String,
	user_id : {type: mongoose.Schema.Types.ObjectId, ref:'users'},
    context:String,
	evaluate : Number,
    commentNumSuppose : Number,
    check:Boolean,
	sendDate : String
})

var commentModel = mongoose.model('comment',comment)
module.exports = commentModel