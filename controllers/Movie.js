const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Recommend = require('../models/recommend')

const { body, check, checkSchema } = require('express-validator')
const { checkError, returnErr } = require('../utils/utils')

// 获取所有电影列表 后续要支持分页
exports.movie_allMovieData = [
    (req, res, next) => {
        Movie.find().exec((err, find_movie) => {
            if (err) { returnErr(res, err, next) }
            if (find_movie) {
                res.json({
                    status: 0,
                    messgae: "获取成功!",
                    total: find_movie.length,
                    data: find_movie
                })
            }
        })
    }
]

// 用户请求下载地址
exports.movie_download = [
    // 验证在路由中的参数
    checkSchema({
        movie_id: {
            in: ['params', 'query'],
            errorMessage: '电影id传递错误',
            trim: true,
            isEmpty: false
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        Movie.findOneAndUpdate(
            {
                _id: req.params.movie_id
            },
            {
                // 更新下载次数
                $inc: {
                    movieNumDownload: 1
                }
            },
            {
                // 每一次返回更新后的数据
                new: true
            })
            .exec((err, find_movie) => {
                if (err) {
                    returnErr(res, err, next, errStatus = 500)
                }
                if (find_movie) {
                    res.json({
                        status: 0,
                        message: "请求成功!",
                        movieDownload: find_movie.movieDownload,
                        movieNumDownload: find_movie.movieNumDownload
                    })
                }
            })
    }
]

// 获取电影的详细信息
exports.movie_movieDetails = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "电影id传递错误!"
        }
    }),
    (req, res, next) => {
        Movie.findById({
            _id: req.params.movie_id
        }, (err, find_movie) => {
            if (err) { returnErr(res, err, next) }
            if (find_movie) {
                res.json({
                    status: 0,
                    message: "获取成功!",
                    data: find_movie
                })
            }
        })
    }
]

// 获取电影的评论
exports.movie_movieComment = [
    checkSchema({
        movie_id: {
            in: ["params", "query"],
            trim: true,
            notEmpty: true,
            errorMessage: "电影id传递错误!"
        }
    }),
    (req, res, next) => {
        Comment.find({
            movie_id: req.params.movie_id
        }, (err, find_comment) => {
            if (err) { returnErr(res, err, next) }
            if (find_comment) {
                res.json({
                    status: 0,
                    message: "获取成功!",
                    data: find_comment
                })
            }
        })
    }
]

// 获取主页电影推荐 支持分页或随机返回
exports.movie_movieRecommend = [
    (req, res, next) => {
        Recommend.find((err, find_recommend) => {
            if (err) { returnErr(res, err, next, errMsg = "获取失败！") }
            if (find_recommend) {
                res.json({
                    status: 0,
                    total: find_recommend.length,
                    data: find_recommend
                })
            }
        })
    }
]

// 用户点赞(暂不设限)
exports.movie_movieSupport = [
    // 验证在路由中的参数
    checkSchema({
        movie_id: {
            in: ['params', 'query'],
            errorMessage: '电影id传递错误',
            trim: true,
            isEmpty: false
        }
    }),
    (req, res, next) => {
        checkError(req, res)
        Movie.findOneAndUpdate(
            {
                _id: req.params.movie_id
            },
            {
                // 更新点赞数
                $inc: {
                    movieNumSuppose: 1
                }
            },
            {
                // 每一次返回更新后的数据
                new: true
            })
            .exec((err, find_movie) => {
                if (err) { returnErr(res, err, next, errMsg = "点赞失败！", errStatus = 500) }
                if (find_movie) {
                    res.json({
                        status: 0,
                        message: "点赞成功!",
                        movieNumSuppose: find_movie.movieNumSuppose,
                    })
                }
            })
    }

]