const User = require("../models/user")
const Movie = require("../models/movie")
const Comment = require("../models/comment")
const Recommend = require("../models/recommend")
const Evaluate = require("../models/movieEvaluate")
const { body, check, checkSchema } = require("express-validator")
const { checkError, returnErr } = require("../utils/utils")

// 获取所有电影列表
exports.movie_allMovieData = [
	(req, res, next) => {
		// 支持分页 索引从0开始
		if (req.query.pageNum && req.query.pageSize) {
			const Num = req.query.pageNum
			const Size = req.query.pageSize
			Movie.find()
				.limit(Size)
				.skip(Size * Num)
				.exec((err, find_movie) => {
					if (err) {
						returnErr(res, err, next)
					}
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
			Movie.find().exec((err, find_movie) => {
				if (err) {
					returnErr(res, err, next)
				}
				if (find_movie) {
					res.json({
						status: 0,
						message: "获取成功!",
						total: find_movie.length,
						data: find_movie
					})
				}
			})
		}
	}
]
// 获取对应tag的电影列表
exports.movie_findTagMovie = [
	// 验证在路由中的参数
	body("tag", "电影tag传递错误").trim().notEmpty(),
	(req, res, next) => {
		if (checkError(req, res)) {
			return
		}
		Movie.find(
			{
				movieCategory: { $regex: req.body.tag }
			},
			(err, find_movie) => {
				if (err) {
					rej(returnErr(res, err, next, (errMsg = "获取失败！")))
				}
				if (find_movie) {
					res.header("Access-Control-Allow-Origin", "*")
					res.json({
						status: 0,
						total: find_movie.length,
						data: find_movie
					})
				}
			}
		)
	}
]
// 用户请求下载地址
exports.movie_download = [
	// 验证在路由中的参数
	checkSchema({
		movie_id: {
			in: ["params", "query"],
			errorMessage: "电影id传递错误",
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
			}
		).exec((err, find_movie) => {
			if (err) {
				returnErr(res, err, next, (errStatus = 500))
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
		Movie.findById(
			{
				_id: req.params.movie_id
			},
			(err, find_movie) => {
				if (err) {
					returnErr(res, err, next)
				}
				if (find_movie) {
					res.json({
						status: 0,
						message: "获取成功!",
						data: find_movie
					})
				}
			}
		)
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
		Comment.aggregate(
			[
				{
					$lookup: {
						from: "users", // 关联的集合
						localField: "user_id", // 本地关联的字段
						foreignField: "_id", // 对方集合关联的字段
						as: "users" // 结果字段名,
					}
				},
				{
					$project: {
						movie_id : 1,
						username: 1,
						context: 1,
						sendDate: 1,
						commentNumSuppose: 1,
						users: { userAvatar: 1 }
					}
				}
			],
			(err, data) => {
				let list = []
				data.forEach((x,index) => {
					if(req.params.movie_id === `${x.movie_id}`){
						list.push(x)
					}
					if(data.length === index+1){
						res.json({
							status: 0,
							total : list.length,
							message: "查询成功!",
							data: list
						})
					}
				})
			}
		)
	}
]

// 用户点赞电影(暂不设限)
exports.movie_movieSupport = [
	// 验证在路由中的参数
	checkSchema({
		movie_id: {
			in: ["params", "query"],
			errorMessage: "电影id传递错误",
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
			}
		).exec((err, find_movie) => {
			if (err) {
				returnErr(res, err, next, (errMsg = "点赞失败！"), (errStatus = 500))
			}
			if (find_movie) {
				res.json({
					status: 0,
					message: "点赞成功!",
					movieNumSuppose: find_movie.movieNumSuppose
				})
			}
		})
	}
]

// 用户点赞评论(暂不设限)
exports.movie_commentSupport = [
	// 验证在路由中的参数
	checkSchema({
		comment_id: {
			in: ["params", "query"],
			errorMessage: "评论id传递错误",
			trim: true,
			isEmpty: false
		}
	}),
	(req, res, next) => {
		checkError(req, res)
		Comment.findOneAndUpdate(
			{
				_id: req.params.comment_id
			},
			{
				// 更新点赞数
				$inc: {
					commentNumSuppose: 1
				}
			},
			{
				// 每一次返回更新后的数据
				new: true
			}
		).exec((err, find_comment) => {
			if (err) {
				returnErr(res, err, next, (errMsg = "点赞失败！"), (errStatus = 500))
			}
			if (find_comment) {
				res.json({
					status: 0,
					message: "点赞成功!",
					commentNumSuppose: find_comment.commentNumSuppose
				})
			}
		})
	}
]
//查询对应电影id的评分列表
exports.movie_findMovieEvaluate = [
	checkSchema({
		movie_id: {
			in: ["params", "query"],
			errorMessage: "电影id传递错误",
			trim: true,
			isEmpty: false
		}
	}),
	(req, res, next) => {
		Evaluate.find({
			movie_id: req.params.movie_id
		}).exec((err, find_movie) => {
			if (err) {
				returnErr(res, err, next, "请求失败!", 500)
				return
			}
			if (find_movie) {
				let sum = 0
				find_movie.forEach((x) => {
					sum += Number(x.evaluate)
				})
				res.json({
					status: 0,
					message: "获取成功!",
					avg_evaluate: Number(sum / find_movie.length).toFixed(1),
					find_movie: find_movie
				})
			}
		})
	}
]
