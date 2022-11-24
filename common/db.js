//数据库插件引入
var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/movieServer';
mongoose.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4
    });
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;
//连接数据库
module.exports = mongoose;