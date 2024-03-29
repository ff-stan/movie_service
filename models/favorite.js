var mongoose = require("../common/db")
// 数据库的数据集
var favorite = new mongoose.Schema({
	movie_id: {type: mongoose.Schema.Types.ObjectId, ref:'movies'},
	movie_name: String,
	user_id: {type: mongoose.Schema.Types.ObjectId, ref:'users'},
	user_name: String,
	favorite: Boolean,
	createDate: String
})

var favoriteModel = mongoose.model("favorite", favorite)
module.exports = favoriteModel
