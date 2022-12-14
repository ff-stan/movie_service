const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Recommend = require('../models/recommend')
const Article = require('../models/article')

const { body, check, checkSchema } = require('express-validator')
const { checkError, returnErr } = require('../utils/utils')


// 获取主页电影推荐 
exports.index_indexRecommend = [
    (req, res, next) => {
        Recommend.find((err, find_recommend) => {
            if (err) { returnErr(res, err, next, errMsg = "获取失败！") }
            if (find_recommend) {
                res.json({
                    status: 0,
                    total: find_recommend.length,
                    data: find_recommend,
                })
            }
        })
    }
]

// 获取主页电影点赞排行榜 支持分页 
exports.index_indexRank = [
    (req, res, next) => {
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
                        messgae: "获取成功!",
                        total: find_movie.length,
                        data: find_movie
                    })
                }
            })
        } else {
            Movie.find().sort({
                movieNumSuppose: -1
            }).exec((err, find_movie) => {
                if (err) { returnErr(res, err, next, errMsg = "获取失败！") }
                if (find_movie) {
                    res.json({
                        status: 0,
                        total: find_movie.length,
                        data: find_movie
                    })
                }
            })
        }
    }
]

// 获取文章列表
exports.index_showArticle = [
    (req, res, next) => {
        // 支持分页 索引从0开始
        if (req.query.pageNum && req.query.pageSize) {
            const Num = req.query.pageNum
            const Size = req.query.pageSize
            Article.find().limit(Size).skip(Size * Num).exec((err, find_article) => {
                if (err) { returnErr(res, err, next) }
                if (find_article) {
                    res.json({
                        status: 0,
                        messgae: "获取成功!",
                        total: find_article.length,
                        data: find_article
                    })
                }
            })
        } else {
            Article.find().exec((err, find_article) => {
                if (err) { returnErr(res, err, next) }
                if (find_article) {
                    res.json({
                        status: 0,
                        messgae: "获取成功!",
                        total: find_article.length,
                        data: find_article
                    })
                }
            })
        }
    }
]

// 获取文章详情
exports.index_articleDetails = [
    checkSchema({
        article_id: {
            in: ['params', 'query'],
            trim: true,
            notEmpty: true,
            errorMessage: "文章id传递错误!"
        }
    }),
    (req, res, next) => {
        Article.findById({
            _id: req.params.article_id
        }).exec((err, find_article) => {
            if (err) { returnErr(res, err, next) }
            if (find_article) {
                res.json({
                    status: 0,
                    messgae: "获取成功!",
                    data: find_article
                })
            }
        })
    }
]