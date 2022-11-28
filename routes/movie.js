const express = require('express')
const router = express.Router()

// 引入控制器
const movie_controller = require('../controllers/Movie')

//获得所有的电影列表
router.get('/', movie_controller.movie_allMovieData)

// 返回下载地址
router.put('/download/:movie_id', movie_controller.movie_download)

//获取相关电影的详细信息
router.get('/details/:movie_id', movie_controller.movie_movieDetails)

//获取相关电影的评论
router.get('/comment/:movie_id', movie_controller.movie_movieComment)

//用户点赞
router.put('/support/:movie_id', movie_controller.movie_movieSupport)

module.exports = router
