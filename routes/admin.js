var express = require('express');
var router = express.Router();

//引入相关的文件和代码包
var user = require('../models/user');
var crypto = require('crypto');
var movie = require('../models/movie');
var mail = require('../models/mail');
var comment = require('../models/comment');
var recommend = require('../models/recommend');
var article = require('../models/article');


const init_token = 'TKLO2o';
//获取MD5值
function getMD5Password(id) {
    var md5 = crypto.createHash('md5');
    var token_before = id + init_token;
    return md5.update(token_before).digest('hex');
}

//后台管理需要验证其用户的后台管理权限
router.post('/adminLogin', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    if (!req.body.userName) {
        res.json({ status: 1, message: "用户名为空" });
    }
    if (!req.body.password) {
        res.json({ status: 1, message: "密码为空" });
    }
    user.findAdmin(req.body.userName, req.body.password, function (err, userSave) {
        if (userSave.length != 0) {
            //通过MD5查看密码
            var token_after = getMD5Password(userSave[0]._id);
            res.json({ status: 0, data: { token_after, user: userSave }, message: "管理员登录成功" });
        } else {
            res.json({ status: 1, message: "用户名或密码错误或不是管理员账户" });
        }
    })
});
//后台管理admin 添加新电影
router.post('/movieAdd', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.movieName) {
        res.json({ status: 1, message: "电影名称为空" });
        x += 1;
    }
    if (!req.body.movieImg) {
        res.json({ status: 1, message: "电影图片为空" });
        x += 1;
    }
    if (!req.body.movieDownload) {
        res.json({ status: 1, message: "电影下载地址为空" });
        x += 1;
    }
    if (!req.body.movieContext) {
        res.json({ status: 1, message: "电影介绍为空" });
        x += 1;
    }
    if (!req.body.movieMainPage) {
        var movieMainPage = false;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //根据数据集建立需要存入数据库的内容
                    var saveMovie = new movie({
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
                        movieMainPage: movieMainPage
                    });
                    saveMovie.save(function (err) {
                        if (err) {
                            res.json({ status: 1, message: err });
                        } else {
                            res.json({ status: 0, message: "添加成功" });
                        }
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//后台管理admin 删除电影
router.post('/movieDel', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.movieId) {
        res.json({ status: 1, message: "电影id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //根据movieId删除对应内容
                    movie.remove({ _id: req.body.movieId }, function (err, delMovie) {
                        res.json({ status: 0, message: '删除成功', data: delMovie });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//后台管理admin 更新电影条目
router.post('/movieUpdate', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.movieId) {
        res.json({ status: 1, message: "电影id传递失败" });
        x += 1;
    }
    //这里前台打包一个电影对象全部发送至后台直接存储
    var saveData = req.body.movieInfo;
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //猜测根据movieID来替换数据库数据
                    movie.update({ _id: req.body.movieId }, saveData, function (err, updateMovie) {
                        res.json({ status: 0, message: '更新成功', data: updateMovie });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//用get方式获取 显示所有电影数据
router.get('/movie', function (req, res, next) {
    movie.findAll(function (err, allMovie) {
        res.json({ status: 0, message: "获取成功", data: allMovie });
    });
});
//用get方式获取 显示后台所有评论
router.get('/commentsList', function (req, res, next) {
    comment.findAll(function (err, allComment) {
        res.json({ status: 0, message: "获取成功", data: allComment });
    });
});
//将评论进行审核 未审核过的不予展示
router.post('/checkComment', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.commentId) {
        res.json({ status: 1, message: "评论id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    comment.update({ _id: req.body.commentId }, { check: true }, function (err, updateComment) {
                        res.json({ status: 0, message: '审核成功', data: updateComment });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//删除评论
router.post('/delComment', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.commentId) {
        res.json({ status: 1, message: "评论id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //在真正的环境下 删除数据需要谨慎在谨慎 最好是应用回收站的机制
                    //使其暂存 而不是直接删除 这样可以保证进行回档和保存
                    comment.remove({ _id: req.body.commentId }, function (err, delComment) {
                        res.json({ status: 0, message: '删除成功', data: delComment });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//封停用户
router.post('/stopUser', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.userId) {
        res.json({ status: 1, message: "用户id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    user.update({ _id: req.body.userId }, { userStop: true }, function (err, updateUser) {
                        res.json({ status: 0, message: '封停成功', data: updateUser });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//解封用户
router.post('/relieveStop', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.userId) {
        res.json({ status: 1, message: "用户id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    user.update({ _id: req.body.userId }, { userStop: false }, function (err, updateUser) {
                        res.json({ status: 0, message: '解封成功', data: updateUser });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});

//更新用户密码(管理员)
router.post('/changeUser', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.userId) {
        res.json({ status: 1, message: "用户id传递失败" });
        x += 1;
    }
    if (!req.body.newPassword) {
        res.json({ status: 1, message: "用户新密码错误" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    user.update({ _id: req.body.userId }, { password: req.body.newPassword }, function (err, changeUser) {
                        res.json({ status: 0, message: '更改成功', data: changeUser });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//显示所有用户
router.post('/showUser', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    user.findAll(function (err, allUser) {
                        res.json({ status: 0, message: '获取成功', data: allUser });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//管理用户权限
router.post('/powerUpdate', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.userId) {
        res.json({ status: 1, message: "用户id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //更新操作
                    user.update({ _id: req.body.userId }, { userPower: 1, userAdmin: true }, function (err, updateUser) {
                        res.json({ status: 0, message: '修改成功', data: updateUser });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//新增文章
router.post('/addArticle', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.articleTitle) {
        res.json({ status: 1, message: "文章名称为空" });
        x += 1;
    }
    if (!req.body.articleContext) {
        res.json({ status: 1, message: "文章内容为空" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //在有权限的情况下 更新操作
                    var saveArticle = new article({
                        articleTitle: req.body.articleTitle,
                        articleContext: req.body.articleContext,
                        articleTime: Date.now(),
                        articleNumSuppose: 0,
                        articleAuthor: req.body.articleAuthor
                    });
                    saveArticle.save(function (err) {
                        if (err) {
                            res.json({ status: 1, message: err });
                        } else {
                            res.json({ status: 0, message: "添加成功" });
                        }
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//后台管理admin 更新电影条目
router.post('/articleUpdate', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.articleId) {
        res.json({ status: 1, message: "文章id传递失败" });
        x += 1;
    }
    //这里前台打包一个电影对象全部发送至后台直接存储
    var saveData = req.body.articleInfo;
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //猜测根据movieID来替换数据库数据
                    article.update({ _id: req.body.articleId }, saveData, function (err, updatearticle) {
                        res.json({ status: 0, message: '更新成功', data: updatearticle });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//删除文章
router.post('/delArticle', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.articleId) {
        res.json({ status: 1, message: "文章id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //在真正的环境下 删除数据需要谨慎在谨慎 最好是应用回收站的机制
                    //使其暂存 而不是直接删除 这样可以保证进行回档和保存
                    article.remove({ _id: req.body.articleId }, function (err, delArticle) {
                        res.json({ status: 0, message: '删除成功', data: delArticle });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//新增主页推荐
router.post('/addRecommend', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.recommendImg) {
        res.json({ status: 1, message: "推荐图片为空" });
        x += 1;
    }
    if (!req.body.recommendSrc) {
        res.json({ status: 1, message: "推荐跳转地址为空" });
        x += 1;
    }
    if (!req.body.recommendTitle) {
        res.json({ status: 1, message: "推荐标题为空" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //在有权限的情况下 更新操作
                    var saveRecommend = new recommend({
                        recommendImg: req.body.recommendImg,
                        recommendSrc: req.body.recommendSrc,
                        recommendTitle: req.body.recommendTitle
                    });
                    saveRecommend.save(function (err) {
                        if (err) {
                            res.json({ status: 1, message: err });
                        } else {
                            res.json({ status: 0, message: "推荐成功" });
                        }
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
//删除主页推荐
router.post('/delRecommend', function (req, res, next) {
    //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
    var x = 0;
    if (!req.body.recommendId) {
        res.json({ status: 1, message: "id传递失败" });
        x += 1;
    }
    //验证
    user.checkAdminPower(req.body.userName, req.body.id, function (err, findUser) {
        //验证用户的情况
        if (!err) {
            if (req.body.userName && req.body.token && req.body.id) {
                if (findUser[0].userAdmin === true && !findUser[0].userStop && findUser[0].userPower === 1 && x < 1) {
                    //在真正的环境下 删除数据需要谨慎在谨慎 最好是应用回收站的机制
                    //使其暂存 而不是直接删除 这样可以保证进行回档和保存
                    recommend.remove({ _id: req.body.recommendId }, function (err, delRecommend) {
                        res.json({ status: 0, message: '删除成功', data: delRecommend });
                    });
                } else {
                    res.json({ status: 1, message: "用户没有权限或者已被停用" });
                }
            } else {
                res.json({ status: 1, message: "用户状态出错" });
            }
        } else {
            res.json({ status: 1, message: err });
        }
    });
});
module.exports = router;
