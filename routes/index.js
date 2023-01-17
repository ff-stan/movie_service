//引入相关的文件和代码包
const express = require("express")
const router = express.Router()
// 引入控制器
const index_controller = require("../controllers/Index")

//获取主页电影推荐
router.get("/recommend", index_controller.index_indexRecommend)
//显示所有的排行榜 也就是对于电影字段index的样式
router.get("/showRank", index_controller.index_indexRank)

// 搜索文章或电影
router.post("/search", index_controller.index_search)

//显示文章列表
router.get("/article", index_controller.index_showArticle)
//显示文章的内容
router.get("/article/:article_id", index_controller.index_articleDetails)
// 显示文章评论
router.get("/article/comment/:article_id", index_controller.index_articleComment)

// 获取头像路径
router.get("/userAvatar/:user_id", index_controller.index_getAvatar)
// 获取个人空间展示信息
router.get("/getUsersData/:user_id", index_controller.index_getUsersData)
//用户查询所有评论历史
router.get("/comment/:user_id", index_controller.index_commentAll)
module.exports = router
