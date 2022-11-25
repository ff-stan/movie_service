//引入相关的文件和代码包
const express = require('express')
const router = express.Router()
// 引入控制器
const user_controller = require('../controllers/User')


/* GET users listing. */
//用户登录接口
router.post('/login', user_controller.user_login)

//用户注册接口
router.post('/register',user_controller.user_regiest)

//用户提交评论
router.post('/postComment',user_controller.user_comment)

//用户点赞
router.put('/support', user_controller.user_support)

//用户找回密码
router.post('/findPassword',user_controller.user_findPassword)

//用户下载只返回下载地址
router.put('/download', user_controller.user_download)

//用户发送站内信
router.post('/sendEmail', user_controller.user_sendEmail)

//用户显示站内信 
router.post('/showEmail',user_controller.user_showEmail)

module.exports = router
