//引入相关的文件和代码包
var mongoose = require('../common/db')
//数据库的数据集
var recommend = new mongoose.Schema({
    recommendImg:String,
    recommendSrc:String,
    recommendTitle:String
})

var recommendModel = mongoose.model('recommend',recommend)

module.exports = recommendModel