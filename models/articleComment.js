//引入数据库的链接模块
var mongoose = require('../common/db')
//数据库的数据集
var articleComment = new mongoose.Schema({
    article_id: {type: mongoose.Schema.Types.ObjectId, ref:'article'},
    username:String,
	user_id : {type: mongoose.Schema.Types.ObjectId, ref:'users'},
    context:String,
    commentNumSuppose : Number,
    check:Boolean,
	sendDate : String
})

var articleCommentModel = mongoose.model('articleComment',articleComment)
module.exports = articleCommentModel