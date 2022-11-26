var mongoose = require('../common/db');

//用户数据集
var user = new mongoose.Schema({
    username: String,
    password: String,
    userMail: String,
    userPhone: Number,
    userAdmin: Boolean,
    userPower: Number,
    userStop: Boolean
});

//用户的查找方法
user.statics.findAll = function(callBack){
    this.find({},callBack);
};

//管理员登录验证
user.statics.findAdmin = function(name,password,callBack){
    this.find({username:name,password:password,userAdmin:true},callBack)
};

//使用用户名查找的方式
user.statics.findByUsername = function(name){
    return new Promise((res,rej) => {
        res(this.find({username:name}))
    }) 
};

user.statics.checkAdminPower = function(name,id,callBack){
    this.find({username:name,_id:id},callBack);
};

//登录匹配是不是拥有相同的用户名和密码并且没有处于封停状态
user.statics.findUserLogin = function(name,password,callBack){
    this.find({username:name,password:password,userStop:false},callBack);
};

//验证邮箱,电话和用户名找到用户
user.statics.findUserPassword = function(name,mail,phone,callBack){
    this.find({username:name,userMail:mail,userPhone:phone},callBack);
};

var userModel = mongoose.model('user',user);
module.exports = userModel;