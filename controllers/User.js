const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Mail = require('../models/mail')

const jwt = require("jsonwebtoken")

const { body, validationResult, check, checkSchema } = require('express-validator')

// 秘钥
const secretKey = 'Amadeus'
// 用户登录
exports.user_login = [
    // 清洗请求过来的数据
    body('userName', '用户名为空!').trim().notEmpty(),
    body('password', '密码为空!').trim().notEmpty(),
    (req, res, next) => {
        // 当验证出现错误时返回错误信息集
        if (checkError(req, res)) {
        } else {
            User.findOne({
                'username': req.body.userName,
                'password': req.body.password
            })
                .exec((err, find_user) => {
                    // 当出现错误时直接退出到下个中间件
                    if (err) {
                        returnErr(res, err, next)
                        return;
                    }
                    if (find_user) {
                        // 签名token
                        const token = jwt.sign({
                            user_name: find_user.username,
                            user_id: find_user._id,
                            userStop: find_user.userStop,
                            userAdmin: find_user.userAdmin
                        }, secretKey, { expiresIn: '24h' })
                        res.json({
                            status: 0,
                            message: "登录成功",
                            // 返回token
                            data: {
                                token: token
                            }
                        })
                    } else {
                        res.status(401).json(
                            {
                                status: 1,
                                message: "用户名或密码错误"
                            })
                    }
                })
        }
    }
]

// 用户注册
exports.user_regiest = [
    // 清洗请求过来的数据
    body('userName', '用户名为空!').trim().notEmpty(),
    body('userName', '用户名长度要求为2-20个字符').isLength({ min: 2, max: 20 }),
    body('password', '密码为空!').trim().notEmpty(),
    body('password', "最少长度为8个字符!").isLength({ min: 8, max: 30 }),
    body('userMail', '电子邮箱验证错误').isEmail().normalizeEmail().trim(),
    body('userPhone', '电话号码为空!').trim().notEmpty(),
    body('userPhone', "最少长度为11个字符!").isLength({ min: 11 }),
    body('userPhone', '请用数字输入!').isInt(),

    (req, res, next) => {
        // 创建数据模型实例
        var user = new User({
            username: req.body.userName,
            password: req.body.password,
            userMail: req.body.userMail,
            userPhone: req.body.userPhone,
            userAdmin: false,
            userPower: 0,
            userStop: false
        })
        // 当有错误时直接返回错误内容
        if (checkError(req, res)) {
        } else {
            // 判断是否已经存在于数据库中 
            User.findOne({ 'username': req.body.userName })
                .exec(function (err, found_user) {
                    // 当出现错误时直接退出到下个中间件
                    if (err) { return next(err) }
                    // 查找到存在的情况
                    if (found_user) {
                        res.json({
                            status: 1,
                            message: `${found_user.username}已存在!!`,
                        })
                    } else {
                        // 不存在 则保存这个模型数据
                        user.save(function (err) {
                            // 当出现错误时直接退出到下个中间件
                            if (err) {
                                returnErr(res, err, next, errStatus = 500)
                                return;
                            }
                            res.json({
                                status: 0,
                                message: "注册成功!"
                            })
                        })
                    }
                })
        }
    }

]

// 用户提交电影评论
exports.user_comment = [
    // 清洗请求过来的数据
    body('movie_id', '电影id为空!').trim().notEmpty(),
    body('context', '评论内容为空!').trim().notEmpty(),
    (req, res, next) => {
        //  创建一个新的模型
        var comment = new Comment({
            username: req.auth.user_name || "匿名用户",
            movie_id: req.body.movie_id,
            context: req.body.context,
            check: 0
        })
        // 当验证出现错误时返回错误信息集
        if (checkError(req, res)) {
        } else {
            // 通过验证后保存模型 返回信息
            comment.save((err) => {
                if (err) {
                    returnErr(res, err, next, errStatus = 500)
                    return;
                }
                res.json({
                    status: 0,
                    massgae: "评论成功!"
                })
            })
        }
    }
]

// 用户点赞(暂不设限)
exports.user_support = [
    // 验证在路由中的参数
    checkSchema({
        movie_id: {
            in: ['params', 'query'],
            errorMessage: '电影id传递错误',
            isEmpty: false
        }
    }),
    (req, res, next) => {
        if (checkError(req, res)) {

        } else {
            Movie.findOneAndUpdate(
                {
                    _id: req.params.movie_id
                },
                {
                    // 更新下载次数
                    $inc: {
                        movieNumSuppose: 1
                    }
                },
                {
                    // 每一次返回更新后的数据
                    new: true
                })
                .exec((err, find_movie) => {
                    if (err) {
                        returnErr(res, err, next, err = "点赞失败！", errStatus = 500)
                        return;
                    }
                    if (find_movie) {
                        res.json({
                            status: 0,
                            message: "点赞成功!",
                            data: {
                                movieNumSuppose: find_movie.movieNumSuppose,
                            }
                        })
                    }
                })
        }
    }
]

// 用户请求下载地址
exports.user_download = [
    // 验证在路由中的参数
    checkSchema({
        movie_id: {
            in: ['params', 'query'],
            errorMessage: '电影id传递错误',
            isEmpty: false
        }
    }),
    (req, res, next) => {
        if (checkError(req, res)) {

        } else {
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
                        return;
                    }
                    if (find_movie) {
                        res.json({
                            status: 0,
                            message: "请求成功!",
                            data: {
                                movieDownload: find_movie.movieDownload,
                                movieNumDownload: find_movie.movieNumDownload
                            }
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
    body('rePassword', "密码为空").trim().notEmpty(),
    (req, res, next) => {
        if (checkError(req, res)) {

        } else {
            // 找到对应的用户并更新
            if (req.auth) {
                User.updateOne({
                    _id: req.auth.user_id,
                    userMail: req.body.userMail,
                    userPhone: req.body.userPhone
                }, {
                    $set: { password: req.body.rePassword }
                }).exec((err, upData_user) => {
                    if (err) {
                        returnErr(res, err, next, errStatus = 500)
                        return;
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
    }
]

// 用户发送站内信
exports.user_sendEmail = [
    // 验证是否有对应的接收用户
    check("toUserName").trim().notEmpty().withMessage("未选择接收用户名").custom((value) => {
        return User.findByUsername(value).then((user) => {
            console.log(user)
            if (user.length === 0) {
                return Promise.reject('选择的用户名不存在')
            }
        })
    }).withMessage("选择的用户名不存在"),
    body("title", "标题为空").trim().notEmpty(),
    body("context", "内容为空").trim().notEmpty(),
    (req, res, next) => {
        if (checkError(req, res)) {

        } else {
            // 检查用户的token是否正确
            if (req.auth) {
                const mail = new Mail({
                    fromUser: req.auth.user_name || "匿名用户",
                    toUser: req.body.toUserName,
                    title: req.body.title,
                    context: req.body.context
                })
                mail.save((err) => {
                    if (err) {
                        returnErr(res, err, next, "发送失败!", 500)
                        return;
                    }
                    res.json({
                        status: 0,
                        data: {
                            massgae: "发送成功!"
                        }
                    })
                })
            }
        }
    }
]

// 用户显示站内信
exports.user_showEmail = [
    (req, res, next) => {
        // 检查用户的token是否正确
        if (req.auth) {
            Mail.find({
                toUser: req.auth.user_name
            }).exec((err, find_mail) => {
                if (err) {
                    returnErr(res, err, next, "请求失败!", 500)
                    return;
                }
                if (find_mail) {
                    res.json({
                        status: 0,
                        message: "获取成功!",
                        data: {
                            find_mail: find_mail
                        }
                    })
                }
            })
        }
    }
]

// 检测数据是否通过合格
function checkError(req, res) {
    //验证请求的所有数据
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 1,
            data: {
                errors: errors.array()
            }
        })
    }
}

// 当查询出现错误时返回错误结果
function returnErr(res, err, next, errMsg, errStatus) {
    res.status(errStatus || 200).json({
        status: 1,
        message: errMsg || "数据出错,请联系管理员更新数据",
        data: {
            err: err
        }
    })
    next(err)
}
