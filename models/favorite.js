var mongoose = require("../common/db")
// 数据库的数据集
var favorite = new mongoose.Schema({
	movie_id: String,
	movie_name: String,
	user_id: String,
	user_name: String,
	favorite: Boolean,
	createDate: String
})

var favoriteModel = mongoose.model("favorite", favorite)
module.exports = favoriteModel
