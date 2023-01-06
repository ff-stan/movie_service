var mongoose = require("../common/db")
// 数据库的数据集
var evaluate = new mongoose.Schema({
	movie_id: String,
	movie_name: String,
	user_id: String,
	user_name: String,
	evaluate: String,
	sendDate: String
})

var evaluateModel = mongoose.model("evaluate", evaluate)
module.exports = evaluateModel
