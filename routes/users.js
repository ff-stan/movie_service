//引入相关的文件和代码包
const express = require("express")
const router = express.Router()
// 引入控制器
const user_controller = require("../controllers/User")

//用户登录接口
router.post("/login", user_controller.user_login)

//用户注册接口
router.post("/register", user_controller.user_regiest)

// 获取用户信息
router.get("/userInfo", user_controller.user_userInfo)
// 用户修改头像
router.post("/changeAvatar",user_controller.user_changeAvatar)
// 用户修改部分信息
router.post("/changeInfo",user_controller.user_changeUserInfo) 

//用户提交评论
router.post("/movieComment", user_controller.user_comment)
//用户查询评论历史
router.get("/movieComment",user_controller.user_commentAll)


// 用户给电影评分
router.post("/evaluate", user_controller.user_evaluate)
// 用户查询评分历史
router.get("/evaluate", user_controller.user_allEvaluate)
//查询对应电影id的评分列表
router.get("/evaluate/movie/:movie_id", user_controller.user_findMovieEvaluate)

//用户找回密码
router.post("/findPassword", user_controller.user_findPassword)

//用户发送站内信
router.post("/sendEmail", user_controller.user_sendEmail)

//用户显示站内信
router.get("/showEmail", user_controller.user_showEmail)
//用户阅读站内信
router.get("/readEmail/:mail_id", user_controller.user_readEmail)
module.exports = router
