const User = require("../models/user")
const Movie = require("../models/movie")
const Favorite = require("../models/Favorite")
const Comment = require("../models/comment")
const Mail = require("../models/mail")
const Evaluate = require("../models/movieEvaluate")

const jwt = require("jsonwebtoken")

const { body, check, checkSchema } = require("express-validator")
const { checkError, returnErr } = require("../utils/utils")
// 秘钥
const secretKey = "Amadeus"
// 用户登录
exports.user_login = [
	// 清洗请求过来的数据
	body("userName")
		.trim()
		.notEmpty()
		.withMessage("用户名为空!")
		.custom((value) => {
			return User.findUserIsStop(value).then((user) => {
				if (user.length >= 1) {
					return Promise.reject("用户已被封停")
				}
			})
		})
		.withMessage("用户已被封停"),
	body("password", "密码为空!").trim().notEmpty(),
	(req, res, next) => {
		// 当验证出现错误时返回错误信息集
		checkError(req, res)
		User.findOne({
			username: req.body.userName,
			password: req.body.password
		}).exec((err, find_user) => {
			// 当出现错误时直接退出到下个中间件
			if (err) {
				returnErr(res, err, next)
				return
			}
			if (find_user) {
				// 签名token
				const token = jwt.sign(
					{
						user_name: find_user.username,
						user_id: find_user._id,
						userStop: find_user.userStop,
						userAdmin: find_user.userAdmin
					},
					secretKey,
					{ expiresIn: "320h" }
				)
				res.json({
					status: 0,
					message: "登录成功",
					// 返回token
					token: token
				})
			} else {
				res.status(401).json({
					status: 1,
					message: "用户名或密码错误"
				})
			}
		})
	}
]

// 用户注册
exports.user_regiest = [
	// 清洗请求过来的数据
	body("userName", "用户名为空!").trim().notEmpty(),
	body("userName", "用户名长度要求为2-20个字符").isLength({ min: 2, max: 20 }),
	body("password", "密码为空!").trim().notEmpty(),
	body("password", "最少长度为8个字符!").isLength({ min: 8, max: 30 }),
	body("userMail", "电子邮箱验证错误").isEmail().normalizeEmail().trim(),
	body("userPhone", "电话号码为空!").trim().notEmpty(),
	body("userPhone", "最少长度为11个字符!").isLength({ min: 11 }),
	body("userPhone", "请用数字输入!").isInt(),

	(req, res, next) => {
		// 创建数据模型实例
		var user = new User({
			username: req.body.userName,
			password: req.body.password,
			userMail: req.body.userMail,
			userPhone: req.body.userPhone,
			userBio: "",
			userSex: req.body.userSex,
			userBirthday: "",
			userAdmin: false,
			userPower: 0,
			userStop: false
		})
		// 当有错误时直接返回错误内容
		if (checkError(req, res)) {
			return
		}
		// 判断是否已经存在于数据库中
		User.findOne({ username: req.body.userName }).exec(function (
			err,
			found_user
		) {
			// 当出现错误时直接退出到下个中间件
			if (err) {
				return next(err)
			}
			// 查找到存在的情况
			if (found_user) {
				res.json({
					status: 1,
					message: `${found_user.username}已存在!!`
				})
			} else {
				// 不存在 则保存这个模型数据
				user.save(function (err) {
					// 当出现错误时直接退出到下个中间件
					if (err) {
						returnErr(res, err, next, (errStatus = 500))
						return
					}
					res.status(201).json({
						status: 0,
						message: "注册成功!"
					})
				})
			}
		})
	}
]

// 获取用户信息
exports.user_userInfo = [
	(req, res, next) => {
		if (req.auth) {
			User.findById(
				{
					_id: req.auth.user_id
				},
				{ password: 0, userAdmin: 0, userStop: 0, userPower: 0, _id: 0, __v: 0 }
			).exec((err, find_user) => {
				if (err) {
					returnErr(res, err, next)
				}
				res.json({
					status: 0,
					messgae: "获取成功!",
					data: find_user
				})
			})
		}
	}
]

// 用户修改信息
exports.user_changeUserInfo = [
	(req, res, next) => {
		if (req.auth) {
			User.findByIdAndUpdate(
				{
					_id: req.auth.user_id
				},
				{
					// 更新特定内容 表单会默认填充之前的数据
					$set: {
						userMail: req.body.userMail,
						userBio: req.body.userBio,
						userSex: req.body.userSex,
						userBirthday: req.body.userBirthday,
						userPhone: req.body.userPhone
					}
				},
				{
					new: true,
					fields : { password: 0, userAdmin: 0, userStop: 0, userPower: 0, _id: 0, __v: 0 }
				}
			).exec((err, new_user) => {
				if (err) {
					returnErr(res, err, next, (errStatus = 500))
				}
				if (new_user) {
					res.json({
						status: 0,
						message: "更新成功!",
						new_user: new_user
					})
				}
			})
		}
	}
]

// 用户修改头像路径
exports.user_changeAvatar = [
	// 清洗请求过来的数据
	body("avatarUrl", "头像路径为空!").trim().notEmpty(),
	(req, res, next) => {
		// 当验证出现错误时返回错误信息集
		checkError(req, res)
		// 通过验证后保存模型 返回信息
		User.findByIdAndUpdate(
			{
				_id: req.auth.user_id,
				username: req.auth.user_name
			},
			{
				$set: {
					userAvatar: req.body.avatarUrl
				}
			},
			{
				new: true,
				fields : { password: 0, userAdmin: 0, userStop: 0, userPower: 0, _id: 0, __v: 0 }
			}
		).exec((err, new_user) => {
			if (err) {
				returnErr(res, err, next, "请求失败!", 500)
				return
			}
			if (new_user) {
				res.json({
					status: 0,
					message: "修改成功!",
					new_user: new_user
				})
			}
		})
	}
]

// 用户提交电影评论
exports.user_comment = [
	// 清洗请求过来的数据
	body("movie_id", "电影id为空!").trim().notEmpty(),
	body("movieName", "电影名称为空!").trim().notEmpty(),
	body("context", "评论内容为空!").trim().notEmpty(),
	(req, res, next) => {
		//  创建一个新的模型
		var comment = new Comment({
			username: req.auth.user_name || "匿名用户",
			movieName: req.body.movieName,
			movie_id: req.body.movie_id,
			context: req.body.context,
			commentNumSuppose: 0,
			sendDate: Date.now(),
			check: false
		})
		// 当验证出现错误时返回错误信息集
		checkError(req, res)
		// 通过验证后保存模型 返回信息
		comment.save((err) => {
			if (err) {
				returnErr(res, err, next, (errStatus = 500))
				return
			}
			res.status(201).json({
				status: 0,
				massgae: "评论成功!"
			})
		})
	}
]
// 用户查看评论历史
exports.user_commentAll = [
	(req, res, next) => {
		// 检查用户的token是否正确
		if (req.auth) {
			Comment.find({
				username: req.auth.user_name
			}).exec((err, find_Comment) => {
				if (err) {
					returnErr(res, err, next, "请求失败!", 500)
					return
				}
				if (find_Comment) {
					res.json({
						status: 0,
						message: "查询成功!",
						find_Comment: find_Comment
					})
				}
			})
		}
	}
]

// 用户给电影评分
exports.user_evaluate = [
	// 清洗请求过来的数据
	body("movie_id", "电影id为空!").trim().notEmpty(),
	body("movie_name", "电影名称为空!").trim().notEmpty(),
	body("evaluate", "评分为空!").trim().notEmpty(),
	(req, res, next) => {
		// 当验证出现错误时返回错误信息集
		checkError(req, res)
		// 对应电影的评分只能有一个 已存在时就更新
		Evaluate.find({
			movie_id: req.body.movie_id,
			movie_name: req.body.movie_name,
			user_id: req.auth.user_id,
			user_name: req.auth.user_name
		}).exec((err, find_evaluate) => {
			if (find_evaluate.length === 0) {
				//  创建一个新的模型
				var evaluate = new Evaluate({
					movie_id: req.body.movie_id,
					movie_name: req.body.movie_name,
					user_id: req.auth.user_id,
					user_name: req.auth.user_name,
					evaluate: req.body.evaluate,
					sendDate: Date.now()
				})
				// 通过验证后保存模型 返回信息
				evaluate.save((err) => {
					if (err) {
						returnErr(res, err, next, (errStatus = 500), (errMsg = "评分失败!"))
						return
					}
					res.status(201).json({
						status: 0,
						massgae: "评分成功!"
					})
				})
			} else {
				Evaluate.findByIdAndUpdate(
					{
						_id: find_evaluate[0]._id
					},
					{
						$set: {
							evaluate: req.body.evaluate
						}
					},
					{
						new: true
					}
				).exec((err, new_evaluate) => {
					if (err) {
						returnErr(res, err, next, (errStatus = 500))
						return
					}
					res.json({
						status: 0,
						message: "评分存在，已修改",
						new_evaluate: new_evaluate
					})
				})
			}
		})
	}
]
// 用户查询自己的评分历史
exports.user_allEvaluate = [
	(req, res, next) => {
		// 检查用户的token是否正确
		if (req.auth) {
			Evaluate.find({
				user_id: req.auth.user_id,
				user_name: req.auth.user_name
			}).exec((err, find_evaluate) => {
				if (err) {
					returnErr(res, err, next, "请求失败!", 500)
					return
				}
				if (find_evaluate) {
					res.json({
						status: 0,
						message: "查询成功!",
						find_evaluate: find_evaluate
					})
				}
			})
		}
	}
]
//查询对应电影id的评分列表
exports.user_findMovieEvaluate = [
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
		// 检查用户的token是否正确
		if (req.auth) {
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
	}
]

// 用户收藏电影
exports.user_favoriteMovie = [
	// 清洗请求过来的数据
	body("movie_id", "电影id为空!").trim().notEmpty(),
	body("movie_name", "电影名称为空!").trim().notEmpty(),
	body("favorite", "是否收藏为空!").trim().notEmpty(),
	(req, res, next) => {
		// 当验证出现错误时返回错误信息集
		if(checkError(req, res)) { return }
		// 对应电影的收藏只能有一个 已存在时就更新
		Favorite.find({
			movie_id: req.body.movie_id,
			movie_name: req.body.movie_name,
			user_id: req.auth.user_id,
			user_name: req.auth.user_name
		}).exec((err, find_favorite) => {
			if (find_favorite.length === 0) {
				//  创建一个新的模型
				var favorite = new Favorite({
					movie_id: req.body.movie_id,
					movie_name: req.body.movie_name,
					user_id: req.auth.user_id,
					user_name: req.auth.user_name,
					favorite: req.body.favorite,
					createDate: Date.now()
				})
				// 通过验证后保存模型 返回信息
				favorite.save((err) => {
					if (err) {
						returnErr(res, err, next, (errStatus = 500), (errMsg = "评分失败!"))
						return
					}
					res.status(201).json({
						status: 0,
						massgae: "收藏成功!"
					})
				})
			} else {
				Favorite.findByIdAndUpdate(
					{
						_id: find_favorite[0]._id
					},
					{
						$set: {
							favorite: req.body.favorite
						}
					},
					{
						new: true
					}
				).exec((err, new_favorite) => {
					if (err) {
						returnErr(res, err, next, (errStatus = 500))
						return
					}
					res.json({
						status: 0,
						message: "已修改!",
						new_favorite: new_favorite
					})
				})
			}
		})
	}
]
// 查询用户收藏列表
exports.user_allFavorite = [
	(req, res, next) => {
		// 检查用户的token是否正确
		if (req.auth) {
			Favorite.find({
				user_id: req.auth.user_id,
				user_name: req.auth.user_name
			}).exec((err, find_favorite) => {
				if (err) {
					returnErr(res, err, next, "请求失败!", 500)
					return
				}
				if (find_favorite) {
					res.json({
						status: 0,
						message: "查询成功!",
						find_favorite: find_favorite
					})
				}
			})
		}
	}
]
//查询对应电影id的收藏数
exports.user_findMoviFavorite = [
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
		// 检查用户的token是否正确
		if (req.auth) {
			Favorite.find({
				movie_id: req.params.movie_id
			}).exec((err, find_movie) => {
				if (err) {
					returnErr(res, err, next, "请求失败!", 500)
					return
				}
				if (find_movie) {
					res.json({
						status: 0,
						message: "获取成功!",
						total: find_movie.length
					})
				}
			})
		}
	}
]


// 用户利用邮箱和手机号码修改密码
exports.user_findPassword = [
	body("userMail", "邮箱验证错误").trim().isEmail().normalizeEmail(),
	body("userPhone", "手机为空").trim().notEmpty(),
	body("rePassword", "密码为空").trim().notEmpty(),
	(req, res, next) => {
		checkError(req, res)
		// 找到对应的用户并更新
		if (req.auth) {
			User.updateOne(
				{
					_id: req.auth.user_id,
					userMail: req.body.userMail,
					userPhone: req.body.userPhone
				},
				{
					$set: { password: req.body.rePassword }
				},
				{
					fields : { password: 0, userAdmin: 0, userStop: 0, userPower: 0, _id: 0, __v: 0 }
				}
			).exec((err, upData_user) => {
				if (err) {
					returnErr(res, err, next, (errStatus = 500))
					return
				}
				// 判断是否匹配到对应数据集
				if (upData_user.matchedCount === 0) {
					res.status(401).json({
						status: 1,
						message: "修改失败,邮箱或手机号码出错!",
						upData_user: upData_user
					})
				} else {
					res.json({
						status: 0,
						message: "修改成功!"
					})
				}
			})
		}
	}
]

// 用户发送站内信
exports.user_sendEmail = [
	// 验证是否有对应的接收用户
	check("toUserName")
		.trim()
		.notEmpty()
		.withMessage("未选择接收用户名")
		.custom((value) => {
			return User.findByUsername(value).then((user) => {
				if (user.length === 0) {
					return Promise.reject("选择的用户名不存在")
				}
			})
		})
		.withMessage("选择的用户名不存在"),
	body("title", "标题为空").trim().notEmpty(),
	body("context", "内容为空").trim().notEmpty(),
	(req, res, next) => {
		checkError(req, res)
		// 检查用户的token是否正确
		if (req.auth) {
			const mail = new Mail({
				fromUser: req.auth.user_name || "匿名用户",
				toUser: req.body.toUserName,
				title: req.body.title,
				context: req.body.context,
				sendDate: Date.now(),
				isRead: false
			})
			mail.save((err) => {
				if (err) {
					returnErr(res, err, next, "发送失败!", 500)
					return
				}
				res.status(201).json({
					status: 0,
					massage: "发送成功!"
				})
			})
		}
	}
]
// 用户显示站内信
exports.user_showEmail = [
	(req, res, next) => {
		// 检查用户的token是否正确
		if (req.auth) {
			// 支持分页 索引从0开始
			if (req.query.pageNum && req.query.pageSize) {
				const Num = req.query.pageNum
				const Size = req.query.pageSize
				Mail.find()
					.limit(Size)
					.skip(Size * Num)
					.exec((err, find_mail) => {
						if (err) {
							returnErr(res, err, next)
						}
						if (find_mail) {
							res.json({
								status: 0,
								messgae: "获取成功!",
								total: find_mail.length,
								data: find_mail
							})
						}
					})
			} else {
				Mail.find({
					toUser: req.auth.user_name
				}).exec((err, find_mail) => {
					if (err) {
						returnErr(res, err, next, "请求失败!", 500)
						return
					}
					if (find_mail) {
						res.json({
							status: 0,
							message: "获取成功!",
							find_mail: find_mail
						})
					}
				})
			}
		}
	}
]
// 用户已读邮件
exports.user_readEmail = [
	checkSchema({
		mail_id: {
			in: ["params", "query"],
			errorMessage: "站内信id传递错误",
			trim: true,
			isEmpty: false
		}
	}),
	(req, res, next) => {
		checkError(req, res)
		// 检查用户的token是否正确
		if (req.auth) {
			Mail.findByIdAndUpdate(
				{
					_id: req.params.mail_id
				},
				{
					$set: {
						isRead: true
					}
				},
				{
					new: true
				}
			).exec((err, find_mail) => {
				if (err) {
					returnErr(res, err, next, "请求失败!", 500)
					return
				}
				if (find_mail) {
					res.json({
						status: 0,
						message: "已读!",
						find_mail: find_mail
					})
				}
			})
		}
	}
]
