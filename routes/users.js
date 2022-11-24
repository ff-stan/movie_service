var express = require('express');
var router = express.Router();
var filter = require('../utils/sanitize');
// 过滤参数
const sanitize = require('mongo-sanitize');
//引入相关的文件和代码包
var user = require('../models/user');

var movie = require('../models/movie');
var mail = require('../models/mail');
var comment = require('../models/comment');
const user_controller = require('../controllers/User')


/* GET users listing. */
//用户登录接口
router.post('/login', user_controller.user_login);

//用户注册接口
router.post('/register',user_controller.user_regiest);

//用户提交评论
router.post('/postComment',user_controller.user_comment);

//用户点赞
router.put('/support', user_controller.user_support);

//用户找回密码
router.post('/findPassword',user_controller.user_findPassword);

//用户下载只返回下载地址
router.post('/download', function (req, res, next) {
  //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
  let reqs = filter(req.body, function (prams) {
    return sanitize(prams);
  });
  if (!reqs.movie_id) {
    res.json({ status: 1, message: "电影id传递失败" });
  };
  movie.findById(reqs.movie_id, function (err, supportMovie) {
    //更新操作
    movie.update({ _id: reqs.movie_id },
      { movieNumDownload: supportMovie[0].movieNumDownload + 1 },
      function (err) {
        if (err) {
          res.json({ status: 1, message: "下载失败", data: err });
        }
        res.json({ status: 0, message: "下载成功", data: supportMovie.movieDownload });
      });
  });
});

//用户发送站内信
router.post('/sendEmail', function (req, res, next) {
  //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
  let reqs = filter(req.body, function (prams) {
    return sanitize(prams);
  });
  if (!reqs.token) {
    res.json({ status: 1, message: "用户登录状态错误" });
  }
  if (!reqs.user_id) {
    res.json({ status: 1, message: "用户登录状态出错" });
  }
  if (!reqs.toUserName) {
    res.json({ status: 1, message: "未选择相关的用户" });
  }
  if (!reqs.title) {
    res.json({ status: 1, message: "标题不能为空" });
  }
  if (!reqs.context) {
    res.json({ status: 1, message: "内容不能为空" });
  }
  if (reqs.token == getMD5Password(reqs.user_id)) {
    //存入数据库之前需要先在数据库中获取到要发送至用户的user_id
    user.findByUsername(reqs.toUserName, function (err, toUser) {
      if (toUser.length != 0) {
        var NewEmail = new mail({
          fromUser: reqs.user_id,
          toUser: toUser[0]._id,
          title: reqs.title,
          context: reqs.context
        });
        NewEmail.save(function () {
          res.json({ status: 0, message: "发送成功" });
        });
      } else {
        res.json({ status: 1, message: "您发送的对象不存在" });
      }
    });
  } else {
    res.json({ status: 1, message: "用户登录状态错误" });
  }
});

//用户显示站内信 其中的receive参数值为1时是发送内容 值为2时是收到的内容
router.post('/showEmail', function (req, res, next) {
  //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
  let reqs = filter(req.body, function (prams) {
    return sanitize(prams);
  });
  if (!reqs.token) {
    res.json({ status: 1, message: "用户登录状态错误" });
  }
  if (!reqs.user_id) {
    res.json({ status: 1, message: "用户登录状态出错" });
  }
  // if(!reqs.receive){
  //   res.json({status:1,message:"参数出错"});
  // }
  if (reqs.token == getMD5Password(reqs.user_id)) {
    if (reqs.receive == 1) {
      //发送的站内信
      mail.findByFromUserId(reqs.user_id, function (err, sendMail) {
        res.json({ status: 0, message: "获取成功", data: sendMail });
      });
    } else {
      //收到的站内信
      mail.findByToUserId(reqs.user_id, function (err, receiveMail) {
        res.json({ status: 0, message: "获取成功", data: receiveMail });
      });
    }
  } else {
    res.json({ status: 1, message: "用户登录出错" });
  }
});

module.exports = router;
