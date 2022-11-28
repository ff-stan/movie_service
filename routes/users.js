//引入相关的文件和代码包
const express = require('express')
const router = express.Router()
// 引入控制器
const user_controller = require('../controllers/User')

//用户登录接口
router.post('/login', user_controller.user_login)

//用户注册接口
router.post('/register',user_controller.user_regiest)

//用户提交评论
router.post('/movieComment',user_controller.user_comment)

//用户找回密码
router.post('/findPassword',user_controller.user_findPassword)

//用户发送站内信
router.post('/sendEmail', user_controller.user_sendEmail)

//用户显示站内信 
router.get('/showEmail',user_controller.user_showEmail)

module.exports = router
