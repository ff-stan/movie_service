//数据库插件引入
var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/movieServer';
mongoose.connect(url);

//连接数据库
module.exports = mongoose;