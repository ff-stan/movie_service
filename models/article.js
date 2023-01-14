//引入相关的文件和代码包
var mongoose = require('../common/db')
//数据库的数据集
var article = new mongoose.Schema({
	articleCover : String,
    articleTitle: String,
    articleContext: String,
    articleTime: String,
    articleNumSuppose: Number,
    articleAuthor: String,
	articleAuthorId : {type: mongoose.Schema.Types.ObjectId, ref:'users'}
})

var articleModel = mongoose.model('article', article)

module.exports = articleModel