const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Mail = require('../models/mail')

const jwt = require("jsonwebtoken")

const { body, check, checkSchema } = require('express-validator')
const { checkError, returnErr } = require('../utils/utils')
// 秘钥
const secretKey = 'Amadeus'
// 用户登录
exports.user_login = [
    // 清洗请求过来的数据
    body('userName').trim().notEmpty().withMessage("用户名为空!").custom((value) => {
        return User.findUserIsStop(value).then((user) => {
            if (user.length >= 1) {
                return Promise.reject("用户已被封停")
            }
        })
    }).withMessage("用户已被封停"),
    body('password', '密码为空!').trim().notEmpty(),
    (req, res, next) => {
        // 当验证出现错误时返回错误信息集
        checkError(req, res)
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
        checkError(req, res)
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
            User.findById({
                _id: req.auth.user_id
            }).exec((err, find_user) => {
                if (err) { returnErr(res, err, next) }
                res.json({
                    status: 0,
                    messgae: "获取成功!",
                    data: find_user
                })
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
            commentNumSuppose: 0,
            check: 0
        })
        // 当验证出现错误时返回错误信息集
        checkError(req, res)
        // 通过验证后保存模型 返回信息
        comment.save((err) => {
            if (err) {
                returnErr(res, err, next, errStatus = 500)
                return;
            }
            res.status(201).json({
                status: 0,
                massgae: "评论成功!"
            })
        })
    }
]

// 用户利用邮箱和手机号码修改密码
exports.user_findPassword = [
    body("userMail", "邮箱验证错误").trim().isEmail().normalizeEmail(),
    body("userPhone", "手机为空").trim().notEmpty(),
    body('rePassword', "密码为空").trim().notEmpty(),
    (req, res, next) => {
        checkError(req, res)
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
]

// 用户发送站内信
exports.user_sendEmail = [
    // 验证是否有对应的接收用户
    check("toUserName").trim().notEmpty().withMessage("未选择接收用户名").custom((value) => {
        return User.findByUsername(value).then((user) => {
            if (user.length === 0) {
                return Promise.reject('选择的用户名不存在')
            }
        })
    }).withMessage("选择的用户名不存在"),
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
                isRead : false
            })
            mail.save((err) => {
                if (err) {
                    returnErr(res, err, next, "发送失败!", 500)
                    return;
                }
                res.status(201).json({
                    status: 0,
                    massgae: "发送成功!"
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
                Mail.find().limit(Size).skip(Size * Num).exec((err, find_mail) => {
                    if (err) { returnErr(res, err, next) }
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
                        return;
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
            in: ['params', 'query'],
            errorMessage: '站内信id传递错误',
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
                }, {
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
                    return;
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
