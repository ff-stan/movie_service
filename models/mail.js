var mongoose = require('../common/db')

//根据数据集建立一个新的mail数据内容
var mail = new mongoose.Schema({
    fromUser: String,
    toUser: String,
    title: String,
    context: String,
    isRead : Boolean
})

var mailModel = mongoose.model('mail',mail)

module.exports = mailModel