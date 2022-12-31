const mongoose = require('../common/db')

//用户数据集
const user = new mongoose.Schema({
    username: String,
    password: String,
    userMail: String,
	userAvatar : String,
	userBio : String,
	userSex : String,
	userBirthday : String,
    userPhone: Number,
    userAdmin: Boolean,
    userPower: Number,
    userStop: Boolean,
})

//管理员登录验证
user.statics.findAdmin = function (name) {
    return new Promise((res, rej) => {
        res(this.find({ username: name, userAdmin: true }))
    })
}

//使用用户名查找的方式
user.statics.findByUsername = function (name) {
    return new Promise((res, rej) => {
        res(this.find({ username: name }))
    })
}

//查找是否被封停 
user.statics.findUserIsStop = function (name) {
    return new Promise((res, rej) => {
        res(this.find({ username: name, userStop: true }))
    })
}

const userModel = mongoose.model('user', user)
module.exports = userModel