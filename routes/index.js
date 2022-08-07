//引入相关的文件和代码包
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var recommend = require('../models/recommend');
var movie = require('../models/movie');
var article = require('../models/article');
var user = require('../models/user');

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Mongoose测试
router.get('/mongooseTest',function(req,res, next){
  mongoose.connect('mongodb://127.0.0.1:27017/pets');
  var CatSchema = mongoose.Schema({
    name:String
  });
  var Cat = mongoose.model('Cat',CatSchema);

  //查询
  Cat.find({name:'tom'},function(err,doc){
    if(err){
      console.log(err);
      return;
    }else{
      console.log(doc);
    }
  });
  //使用res.send()方法来输入一个提示
  res.send('数据库连接测试');
});

//显示主页的推荐大图等
router.get('/showIndex',function(req,res,next){
  recommend.findAll(function(err,getRecommend){
    res.json({status:0,message:"获取推荐",data:getRecommend});
  });
});

//显示所有的排行榜 也就是对于电影字段index的样式
router.get('/showRanking',function(req,res,next){
  movie.findAll(function(err,getMovies){
    res.json({status:0,message:"获取主页",data:getMovies});
  });
});

//显示文章列表
router.get('/showArticle',function(req,res,next){
  article.findAll(function(err,getArticles){
    res.json({status:0,message:"获取到所有文章",data:getArticles});
  });
});

//显示文章的内容
router.post('/articleDetail',function(req,res,next){
  //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
  if(!req.body.article_id){
    res.json({status:1,message:"文章id出错"});
  }
  article.findByArticleId(req.body.article_id,function(err,getArticle){
    res.json({status:0,message:"获取成功",data:getArticle});
  });
});

//显示用户个人信息的内容
router.post('/showUser',function(req,res,next){
  //验证完整性 这里使用简单的if方式 可以使用正则表达式对输入的格式进行验证
  if(!req.body.user_id){
    res.json({status:1,message:"用户状态出错"});
  }
  user.findById(req.body.user_id,function(err,getUser){
    res.json({status:0,message:"获取成功",data:{
      user_id:getUser._id,
      username:getUser.username,
      userMail:getUser.userMail,
      userPhone:getUser.userPhone,
      userStop:getUser.userStop,
      userAdmin:getUser.userAdmin
    }});
  });
});
module.exports = router;