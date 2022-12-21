//引入相关的文件和代码包
var mongoose = require('../common/db')
//数据库的数据集
var article = new mongoose.Schema({
    articleTitle: String,
    articleContext: String,
    articleTime: { type: Date, default: Date.now },
    articleNumSuppose: Number,
    articleAuthor: String
})

var articleModel = mongoose.model('article', article)

module.exports = articleModel