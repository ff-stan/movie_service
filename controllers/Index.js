const User = require("../models/user")
const Movie = require("../models/movie")
const Comment = require("../models/comment")
const Recommend = require("../models/recommend")
const Article = require("../models/article")
const Favorite = require("../models/favorite")
const { body, check, checkSchema } = require("express-validator")
const { checkError, returnErr } = require("../utils/utils")

// 获取主页电影推荐
exports.index_indexRecommend = [
	(req, res, next) => {
		Movie.find(
			{
				movieMainPage: true
			},
			(err, find_recommend) => {
				if (err) {
					returnErr(res, err, next, (errMsg = "获取失败！"))
				}
				if (find_recommend) {
					res.json({
						status: 0,
						total: find_recommend.length,
						data: find_recommend
					})
				}
			}
		)
	}
]
// 获取主页电影点赞排行榜 支持分页
exports.index_indexRank = [
	(req, res, next) => {
		// 支持分页 索引从0开始
		if (req.query.pageNum && req.query.pageSize) {
			const Num = req.query.pageNum
			const Size = req.query.pageSize
			Movie.find()
				.sort({
					movieNumSuppose: -1
				})
				.limit(Size)
				.skip(Size * Num)
				.exec((err, find_movie) => {
					if (err) {
						returnErr(res, err, next)
					}
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
			Movie.find()
				.sort({
					movieNumSuppose: -1
				})
				.exec((err, find_movie) => {
					if (err) {
						returnErr(res, err, next, (errMsg = "获取失败！"))
					}
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

// 获取search列表 返回电影与文章的搜索结果
exports.index_search = [
	body("searchValue", "搜索内容为空!").trim().notEmpty(),
	(req, res, next) => {
		if (checkError(req, res)) {
			return
		}
		const searchData = {}
		// 先搜索电影名称
		const movie = new Promise((resolve, rej) => {
			Movie.find(
				{
					movieName: { $regex: req.body.searchValue }
				},
				(err, find_movie) => {
					if (err) {
						rej(returnErr(res, err, next, (errMsg = "获取失败！")))
					}
					if (find_movie) {
						searchData.movie = {
							total: find_movie.length,
							data: find_movie
						}
						resolve()
					}
				}
			)
		})
		// 再搜索文章标题
		const article = new Promise((resolve, rej) => {
			Article.find(
				{
					articleTitle: { $regex: req.body.searchValue }
				},
				(err, find_article) => {
					if (err) {
						rej(returnErr(res, err, next, (errMsg = "获取失败！")))
					}
					if (find_article) {
						searchData.article = {
							total: find_article.length,
							data: find_article
						}
						resolve()
					}
				}
			)
		})
		// 当两个promise都res才会返回结果
		Promise.all([movie, article]).then(() => {
			res.json({
				status: 0,
				searchData: searchData
			})
		})
	}
]

// 获取文章列表
exports.index_showArticle = [
	(req, res, next) => {
		// 支持分页 索引从0开始
		if (req.query.pageNum && req.query.pageSize) {
			const Num = req.query.pageNum
			const Size = req.query.pageSize
			Article.find()
				.limit(Size)
				.skip(Size * Num)
				.exec((err, find_article) => {
					if (err) {
						returnErr(res, err, next)
					}
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
				if (err) {
					returnErr(res, err, next)
				}
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
			in: ["params", "query"],
			trim: true,
			notEmpty: true,
			errorMessage: "文章id传递错误!"
		}
	}),
	(req, res, next) => {
		Article.findById({
			_id: req.params.article_id
		}).exec((err, find_article) => {
			if (err) {
				returnErr(res, err, next)
			}
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

// 获取头像路径
exports.user_getAvatar = [
	checkSchema({
		user_id: {
			in: ["params", "query"],
			errorMessage: "用户id传递错误",
			trim: true,
			isEmpty: false
		}
	}),
	(req, res, next) => {
		User.find(
			{
				_id: req.params.user_id
			},
			{ userAvatar: 1 }
		).exec((err, find_userAvatar) => {
			if (err) {
				returnErr(res, err, next, "请求失败!", 500)
				return
			}
			if (find_userAvatar) {
				res.json({
					status: 0,
					message: "查询成功!",
					find_userAvatar: find_userAvatar
				})
			}
		})
	}
]

// 获取个人空间展示信息
exports.user_getUsersData = [
	checkSchema({
		user_id: {
			in: ["params", "query"],
			errorMessage: "用户id传递错误",
			trim: true,
			isEmpty: false
		}
	}),
	(req, res, next) => {
		// 联合查询
		User.aggregate(
			[
				{
					$project: { userAvatar: 1, username: 1, userSex: 1, userBio: 1 }
				},
				{
					$lookup: {
						from: "favorites", // 关联的集合
						localField: "_id", // 本地关联的字段
						foreignField: "user_id", // 对方集合关联的字段
						as: "favorites" // 结果字段名,
					}
				},
				{
					$match : { favorites : {$elemMatch : {$ne:null}} }
				}
			],
			(err, data) => {
				res.json({
					status: 0,
					message: "查询成功!",
					data: data
				})
			}
		)
	}
]
