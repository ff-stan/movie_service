const createError = require('http-errors')
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')

const jwt = require("jsonwebtoken")
const { expressjwt } = require("express-jwt")
const secretKey = 'Amadeus'

// 压缩发送回客户端的 HTTP 响应的中间件
const compression = require('compression')
// 可以设置适当的 HTTP 标头中间件 避免一些web漏洞
const helmet = require('helmet')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const adminRouter = require('./routes/admin')
const movieRouter = require('./routes/movie')

const app = express()

// 添加压缩发送回客户端的 HTTP 响应的中间件
app.use(compression())
// 添加设置适当的 HTTP 标头中间件
app.use(helmet())

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// 只要配置成功 express-jwt 就可以把解析出来的用户信息 挂载到req.auth属性上
app.use(
  expressjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({
    path: ['/users/login',
      '/users/register',
      '/admin/adminLogin',
      /^\/movie\/.*/,
      /^\/index\/.*/,
      /^\/static\/.*/,
    ],
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 设置跨域
app.use('/', cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


// 设置路由路径
app.use('/index', indexRouter)
app.use('/users', usersRouter)
app.use('/admin', adminRouter)
app.use('/movie', movieRouter)

// 设置静态文件路径 可以用http://localhost:3000/static/images/5.jpg 访问到public下的文件夹
let options = {
  setHeaders: function (res, path, stat) {
    res.set('Cross-Origin-Resource-Policy',"cross-origin")
  }
}
app.use("/static",express.static(path.join(__dirname, 'public'),options))

// 返回404
app.use(function (req, res, next) {
  next(createError(404))
})
// token错误信息处理 
app.use((err, req, res, next) => {
  // 这次错误是由 token 解析失败导致的
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      status: 401,
      message: '无效的token',
    })
  }
  console.log(err)
  res.status(500).send({
    status: 500,
	err : err,
    message: '未知的错误',
  })
})

// 错误信息处理 必须在所有其它的app.use()和路由调用后才能调用 
// 因此它们是需求处理过程中最后的中间件
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
});

module.exports = app
