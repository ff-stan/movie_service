//引入相关的文件和代码包
const express = require("express")
const router = express.Router()
// 引入控制器
const mock_controller = require("../controllers/Mock")

// 关于官网点击 登录 注册的模拟埋点数据
router.get('/website', mock_controller.mock_WebsiteClick)

// 关于评论相关的埋点模拟数据
router.get('/comment', mock_controller.mock_commentSend)

// 关于电影和文章点击相关的埋点模拟数据
router.get('/click', mock_controller.mock_click)
module.exports = router
