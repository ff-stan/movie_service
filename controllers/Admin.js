const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Mail = require('../models/mail')

const jwt = require("jsonwebtoken")
// 秘钥
const secretKey = 'Amadeus'

const { body, check, checkSchema } = require('express-validator')
const { checkError, returnErr } = require('../utils/utils')

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
                        messgae: "登录成功!",
                        token: token
                    })
                } else {
                    res.status(401).json({
                        messgae: "登录失败!用户名或密码错误!"
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
            Movie.find().exec((err, all_Data) => {
                res.json({
                    status: 0,
                    message: "获取成功!",
                    total: all_Data.length,
                    rows: all_Data
                })
            })
        } else {
            res.json({
                status: 1,
                message: "获取失败!"
            })
        }
    }
]