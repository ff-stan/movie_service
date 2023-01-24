//数据库插件引入
const mongoose = require('mongoose')
// 
const url = 'mongodb://movie:1240@43.138.224.168:12406/movie_Service'
mongoose.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4
    })
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise
//连接数据库
module.exports = mongoose