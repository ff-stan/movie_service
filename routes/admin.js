const express = require('express')
const router = express.Router()
// 路由控制器
const admin_controllers = require("../controllers/Admin")


//后台上传图片
router.post('/upload', admin_controllers.admin_uploadImg)

//导出电影数据Excel文件
router.get('/download/movie',admin_controllers.admin_downloadMovie)
//导出文章数据Excel文件
router.get('/download/article',admin_controllers.admin_downloadArticles)
//导出用户数据Excel文件
router.get('/download/user',admin_controllers.admin_downloadUsers)

//后台管理需要验证其用户的后台管理权限
router.post('/adminLogin', admin_controllers.admin_adminLogin)

//后台管理admin 添加新电影
router.post('/movie', admin_controllers.admin_addMovieData)
//后台管理admin 删除电影
router.delete('/movie/:movie_id', admin_controllers.admin_delMovieData)
//后台管理admin 更新电影条目
router.put('/movie/:movie_id', admin_controllers.admin_upMovieData)
//显示所有电影数据
router.get('/movie', admin_controllers.admin_movieData)
//新增主页推荐
router.put('/movie/addrecommend/:movie_id', admin_controllers.admin_addRecommend)
//删除主页推荐
router.put('/movie/delrecommend/:movie_id', admin_controllers.admin_delRecommend)

//用get方式获取 显示后台所有已审核或未审核评论 
router.get('/movie/comment/:checkType', admin_controllers.admin_movieAllComment)
//将评论进行审核 未审核过的不予展示
router.put('/movie/comment/:comment_id', admin_controllers.admin_movieCheckComment)
//删除评论
router.delete('/movie/comment/:comment_id', admin_controllers.admin_movieDelComment)

//显示所有用户
router.get('/user', admin_controllers.admin_userList)
//封停用户
router.put('/user/addStop/:user_id', admin_controllers.admin_userAddStop)
//解封用户
router.put('/user/delStop/:user_id', admin_controllers.admin_userDelStop)
//更新用户密码(管理员)
router.post('/user/changePwd', admin_controllers.admin_changeUserPwd)
//升级成为管理员用户
router.put('/user/addAdmin/:user_id', admin_controllers.admin_addAdmin)
//降级成为普通用户
router.put('/user/delAdmin/:user_id', admin_controllers.admin_delAdmin)

//新增文章
router.post('/article', admin_controllers.admin_addArticle)
//后台管理admin 更新电影条目
router.put('/article/:article_id', admin_controllers.admin_updataArticle)
//删除文章
router.delete('/article/:article_id', admin_controllers.admin_delArticle)
// 获取所有文章评论
router.get('/articleComment/:checkType', admin_controllers.admin_allArticleComment)
//将评论进行审核 未审核过的不予展示
router.put('/articleComment/:comment_id', admin_controllers.admin_CheckArticleComment)
//删除评论
router.delete('/articleComment/:comment_id', admin_controllers.admin_DelArticleComment)

// 删除电影评分
router.delete('/evaluate/:evaluate_id',admin_controllers.admin_delEvaluate)

module.exports = router
