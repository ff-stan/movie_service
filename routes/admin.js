const express = require('express')
const router = express.Router()
// 路由控制器
const admin_controllers = require("../controllers/Admin")

// 上传文件中间件
const Busboy = require('busboy')
const fs = require('fs')
//后台上传文件路由
// router.post('/upload', (req, res) => {
//     //需要验证用户权限
//     var x = 0;
//     if (!req.headers) {
//         res.json({ status: 1, message: "请求头错误" });
//         x += 1;
//     }
//     //验证
//     user.checkAdminPower(req.headers.username, req.headers.id, function (err, findUser) {
//         //验证用户的情况
//         if (!err) {
//             if (req.headers.username && req.headers.token && req.headers.id) {
//                 if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
//                     //通过请求头信息创建busboy对象
//                     let busboy = Busboy({ headers: req.headers })
//                     //将流链接到busboy对象
//                     req.pipe(busboy)
//                     //监听file事件获取文件(字段名，文件，文件名，传输编码，mime类型)
//                     busboy.on('file', (filedname, file, filename, encoding, mimetype) => {
//                         //创建一个可写流
//                         let writeStream = fs.createWriteStream('./public/upload/' + filename.filename)
//                         //监听data事件，文件数据接受完毕，关闭这个可写域
//                         file.on('data', (data) => writeStream.write(data))
//                         // 监听end事件，文件数据接收完毕，关闭这个可写流
//                         file.on('end', (data) => writeStream.end())
//                         // 监听finish完成事件，完成后定向到首页
//                         busboy.on('finish', () => {
//                             res.json({ status: 0, message: "文件上传成功" });
//                             res.end()
//                         })
//                     })
//                 } else {
//                     res.json({ status: 1, message: "用户没有权限或者已被停用" });
//                 }
//             } else {
//                 res.json({ status: 1, message: "用户状态出错" });
//             }
//         } else {
//             res.json({ status: 1, message: err });
//         }
//     });
// });


//后台管理需要验证其用户的后台管理权限
router.post('/adminLogin', admin_controllers.admin_adminLogin)

//后台管理admin 添加新电影
router.post('/movie', admin_controllers.admin_addMovieData)
//后台管理admin 删除电影
router.delete('/movie/:movie_id', admin_controllers.admin_delMovieData)
//后台管理admin 更新电影条目
router.put('/movie/:movie_id', admin_controllers.admin_upMovieData)
//用get方式获取 显示所有电影数据
router.get('/movie', admin_controllers.admin_movieData)
//新增主页推荐
router.put('/movie/addrecommend/:movie_id', admin_controllers.admin_addRecommend)
//删除主页推荐
router.put('/movie/delrecommend/:movie_id', admin_controllers.admin_delRecommend)

//用get方式获取 显示后台所有评论
router.get('/movie/comment', admin_controllers.admin_movieAllComment)
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

module.exports = router
