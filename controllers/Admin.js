const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Mail = require('../models/mail')
const Article = require('../models/article')
const Recommend = require('../models/recommend')

const jwt = require("jsonwebtoken")
// 秘钥
const secretKey = 'Amadeus'

const { body, check, checkSchema } = require('express-validator')
const { checkError, returnErr } = require('../utils/utils')

// 上传文件中间件
const Busboy = require('busboy')
const fs = require('fs')

// 管理员登录
exports.admin_adminLogin = [
    // 验证权限与是否封停
    body("userName").trim().notEmpty().withMessage("用户名为空!").custom((value) => {
        return User.findAdmin(value).then((user) => {
            if (user.length === 0) {
                return Promise.reject("用户权限不足")
            }
        })
    }).withMessage("用户权限不足").custom((value) => {
        return User.findUserIsStop(value).then((user) => {
            if (user.length >= 1) {
                return Promise.reject("用户已被封停")
            }
        })
    }).withMessage("用户已被封停"),
    body("password").trim().notEmpty().withMessage("密码为空!"),
    (req, res, next) => {
        if (checkError(req, res)) {

        } else {
            User.findOne({
                username: req.body.userName,
                password: req.body.password,
                userAdmin: true,
                userStop: false
            }).exec((err, find_user) => {
                if (err) { returnErr(res, err, next) }
                if (find_user) {
                    // 签名token
                    const token = jwt.sign({
                        user_name: find_user.username,
                        user_id: find_user._id,
                        userStop: find_user.userStop,
                        userAdmin: find_user.userAdmin
                    }, secretKey, { expiresIn: '24h' })
                    res.json({
                        message: "登录成功!",
                        token: token
                    })
                } else {
                    res.status(401).json({
                        message: "登录失败!用户名或密码错误!"
                    })
                }
            })
        }

    }
]

// 添加电影项目
exports.admin_addMovieData = [
    body("movieName").trim().notEmpty().withMessage("电影名称为空!"),
    body("movieImg").trim().notEmpty().withMessage("电影图片路径为空!"),
    body("movieDownload").trim().notEmpty().withMessage("电影下载地址为空!"),
    body("movieCategory").trim().notEmpty().withMessage("电影词条为空!"),
    body("movieArea").trim().notEmpty().withMessage("电影地区为空!"),
    body("movieContext").trim().notEmpty().withMessage("电影介绍为空!"),
    body("movieMainPage").default(false),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            const saveMovie = new Movie({
                movieName: req.body.movieName,
                movieContext: req.body.movieContext,
                movieImg: req.body.movieImg,
                movieVideo: req.body.movieVideo,
                movieDownload: req.body.movieDownload,
                movieCategory: req.body.movieCategory,
                movieArea: req.body.movieArea,
                movieDuration: req.body.movieDuration,
                movieCastMembers: req.body.movieCastMembers,
                movieTime: Date.now(),
                movieNumSuppose: 0,
                movieNumDownload: 0,
                movieMainPage: req.body.movieMainPage
            })
            saveMovie.save((err) => {
                if (err) {
                    returnErr(res, err, next, errStatus = 500)
                }
                res.status(201).json({ status: 0, message: "添加成功" })
            })
        } else {
            returnErr(res, err, next, errMsg = "用户没有权限", errStatus = 403)
        }
    }
]
// 删除电影项目
exports.admin_delMovieData = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            errorMessage: '电影id传递错误',
            trim: true,
            isEmpty: false
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Movie.findByIdAndDelete({
                _id: req.params.movie_id
            }, (err, find_movie) => {
                if (err) {
                    returnErr(res, err, next)
                }
                res.json({
                    status: 0,
                    message: "删除成功!"
                })
            })
        }
    }
]
// 更新电影项目内容
exports.admin_upMovieData = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            errorMessage: "电影id传递失败!",
            trim: true,
            isEmpty: false
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Movie.findByIdAndUpdate(
                {
                    _id: req.params.movie_id
                },
                {
                    // 更新特定内容 表单会默认填充之前的数据
                    $set: {
                        movieName: req.body.movieName,
                        movieContext: req.body.movieContext,
                        movieImg: req.body.movieImg,
                        movieVideo: req.body.movieVideo,
                        movieDownload: req.body.movieDownload,
                        movieCategory: req.body.movieCategory,
                        movieArea: req.body.movieArea,
                        movieDuration: req.body.movieDuration,
                        movieCastMembers: req.body.movieCastMembers,
                        movieMainPage: req.body.movieMainPage
                    }
                },
                {
                    new: true
                }
            ).exec((err, find_movie) => {
                if (err) { returnErr(res, err, next, errStatus = 500) }
                if (find_movie) {
                    res.json({
                        status: 0,
                        message: "更新成功!",
                        find_movie: find_movie
                    })
                }
            })
        }
    }
]
// 获取所有电影数据
exports.admin_movieData = [
    (req, res, next) => {
        if (req.auth.userAdmin) {
            // 支持分页 索引从0开始
            if (req.query.pageNum && req.query.pageSize) {
                const Num = req.query.pageNum
                const Size = req.query.pageSize
                Movie.find().sort({
                    movieNumSuppose: -1
                }).limit(Size).skip(Size * Num).exec((err, find_movie) => {
                    if (err) { returnErr(res, err, next) }
                    if (find_movie) {
                        res.json({
                            status: 0,
                            message: "获取成功!",
                            total: find_movie.length,
                            data: find_movie
                        })
                    }
                })
            } else {
                Movie.find().exec((err, all_Data) => {
                    res.json({
                        status: 0,
                        message: "获取成功!",
                        total: all_Data.length,
                        rows: all_Data
                    })
                })
            }
        }
    }

]

// 获取所有评论
exports.admin_movieAllComment = [
    (req, res, next) => {
        if (req.auth.userAdmin) {
            Comment.find().exec((err, find_comment) => {
                if (err) { returnErr(res, err, next, errStatus = 500) }
                if (find_comment) {
                    res.json({
                        status: 0,
                        message: "获取成功!",
                        total: find_comment.length,
                        rows: find_comment
                    })
                }
            })
        }
    }
]
// 审核评论
exports.admin_movieCheckComment = [
    checkSchema({
        comment_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "评论id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Comment.findByIdAndUpdate(
                {
                    _id: req.params.comment_id
                },
                {
                    $set: {
                        check: true
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_comment) => {
                if (err) { returnErr(res, err, next, errMsg = "审核失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "审核成功!",
                    data: updata_comment
                })
            })
        }
    }
]
// 删除评论
exports.admin_movieDelComment = [
    checkSchema({
        comment_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "评论id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Comment.findByIdAndRemove(
                {
                    _id: req.params.comment_id
                }
            ).exec((err) => {
                if (err) { returnErr(res, err, next, errMsg = "删除失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "删除成功!"
                })
            })
        }
    }
]

// 封停用户
exports.admin_userAddStop = [
    checkSchema({
        user_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "用户id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            User.findByIdAndUpdate(
                {
                    _id: req.params.user_id
                },
                {
                    $set: {
                        userStop: true
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_user) => {
                if (err) { returnErr(res, err, next, errMsg = "封停失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "封停成功",
                    data: updata_user
                })
            })
        }
    }
]
// 解封用户
exports.admin_userDelStop = [
    checkSchema({
        user_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "用户id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            User.findByIdAndUpdate(
                {
                    _id: req.params.user_id
                },
                {
                    $set: {
                        userStop: false
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_user) => {
                if (err) { returnErr(res, err, next, errMsg = "解封失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "解封成功",
                    data: updata_user
                })
            })
        }
    }
]
// 更新用户密码
exports.admin_changeUserPwd = [
    body("user_id").trim().notEmpty().withMessage("用户id传递错误!"),
    body("password").trim().notEmpty().withMessage("新密码为空!")
        .isLength({ min: 8, max: 30 }).withMessage("密码长度不符合要求!"),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            User.findByIdAndUpdate(
                {
                    _id: req.body.user_id
                },
                {
                    $set: {
                        password: req.body.password
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_user) => {
                if (err) { returnErr(res, err, next, errMsg = "更改失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "更改成功",
                    data: updata_user
                })
            })
        }
    }
]
// 获取所有用户信息
exports.admin_userList = [
    (req, res, next) => {
        if (req.auth.userAdmin) {
            User.find().exec((err, find_user) => {
                if (err) { returnErr(res, err, next, errMsg = "获取失败!", errStatus = 500) }
                if (find_user) {
                    res.json({
                        status: 0,
                        message: "获取成功!",
                        total: find_user.length,
                        rows: find_user
                    })
                }
            })
        }
    }
]
// 升级成为管理员用户
exports.admin_addAdmin = [
    checkSchema({
        user_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "用户id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            User.findByIdAndUpdate(
                {
                    _id: req.params.user_id
                },
                {
                    $set: {
                        userAdmin: true
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_user) => {
                if (err) { returnErr(res, err, next, errMsg = "修改失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "修改成功",
                    data: updata_user
                })
            })
        }
    }
]
// 降级成为普通用户
exports.admin_delAdmin = [
    checkSchema({
        user_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "用户id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            User.findByIdAndUpdate(
                {
                    _id: req.params.user_id
                },
                {
                    $set: {
                        userAdmin: false
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_user) => {
                if (err) { returnErr(res, err, next, errMsg = "修改失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "修改成功",
                    data: updata_user
                })
            })
        }
    }
]

// 新增文章
exports.admin_addArticle = [
    checkSchema({
        articleTitle: {
            trim: true,
            notEmpty: true,
            errorMessage: "文章标题为空!"
        },
        articleContext: {
            trim: true,
            notEmpty: true,
            errorMessage: "文章内容为空!"
        }
    }),
    (req, res, next) => {
        if (req.auth.userAdmin) {
            const article = new Article({
                articleTitle: req.body.articleTitle,
                articleContext: req.body.articleContext,
                articleAuthor: req.auth.user_name
            })
            article.save((err, new_article) => {
                if (err) { returnErr(res, err, next, errMsg = "添加失败!", errStatus = 500) }
                res.status(201).json({
                    status: 0,
                    message: "添加成功!",
                    data: new_article
                })
            })
        }
    }
]
// 更新文章
exports.admin_updataArticle = [
    checkSchema({
        article_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "文章id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Article.findByIdAndUpdate(
                {
                    _id: req.params.article_id
                },
                {
                    $set: {
                        articleTitle: req.body.articleTitle,
                        articleContext: req.body.articleContext
                    }
                },
                {
                    new: true
                }).exec((err, updata_article) => {
                    if (err) { returnErr(res, err, next, errMsg = "添加失败!", errStatus = 500) }
                    res.json({
                        status: 0,
                        message: "更新成功!",
                        data: updata_article
                    })
                })
        }
    }
]
// 删除文章
exports.admin_delArticle = [
    checkSchema({
        article_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "文章id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Article.findByIdAndRemove(
                {
                    _id: req.params.article_id
                }
            ).exec((err) => {
                if (err) { returnErr(res, err, next, errMsg = "删除失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "删除成功!"
                })
            })
        }
    }
]

// 新增主页推荐
exports.admin_addRecommend = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "电影id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Movie.findByIdAndUpdate(
                {
                    _id: req.params.movie_id
                },
                {
                    $set: {
                        movieMainPage: true
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_movie) => {
                if (err) { returnErr(res, err, next, errMsg = "推荐失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "推荐成功",
                    data: updata_movie
                })
            })
        }
    }
]
// 删除主页推荐
exports.admin_delRecommend = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "电影id传递错误!"
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        if (req.auth.userAdmin) {
            Movie.findByIdAndUpdate(
                {
                    _id: req.params.movie_id
                },
                {
                    $set: {
                        movieMainPage: false
                    }
                },
                {
                    new: true
                }
            ).exec((err, updata_movie) => {
                if (err) { returnErr(res, err, next, errMsg = "取消推荐失败!", errStatus = 500) }
                res.json({
                    status: 0,
                    message: "取消推荐成功",
                    data: updata_movie
                })
            })
        }
    }
]

// 上传图片接口
exports.admin_uploadImg = [
    (req, res, next) => {
        // 这里很奇怪 明明请求头有携带token 却没有自动解析
        // if (req.auth) {
            //通过请求头信息创建busboy对象
            let busboy = Busboy({
                headers: req.headers,
                limits: {
                    // 最大大小 10mb
                    fileSize: 1048576 * 10
                }
            })
            //将流链接到busboy对象
            req.pipe(busboy)
            //监听file事件获取文件(字段名，文件，文件名，传输编码，mime类型)
            busboy.on('file', (filedname, file, filename, encoding, mimetype) => {
                //创建一个可写流
                let writeStream = fs.createWriteStream('./public/upload/' + filename.filename)
                //监听data事件，文件数据接受完毕，关闭这个可写域
                file.on('data', (data) => writeStream.write(data))
                // 监听end事件，文件数据接收完毕，关闭这个可写流
                file.on('end', (data) => writeStream.end())
                // 监听finish完成事件
                busboy.on('finish', () => {
                    res.json({
                        status: 0,
                        message: "文件上传成功",
                        url : `http://amdeus.top:3000/static/upload/${filename.filename}`
                    })
                    res.end()
                })
            })
        // }else{
        //     res.status(401).json({
        //         errno : 1,
        //         message : "身份验证出错!"
        //     })
        // }
    }
]
