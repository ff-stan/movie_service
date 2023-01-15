var mongoose = require("../common/db")
// 数据库的数据集
var evaluate = new mongoose.Schema({
	movie_id: {type: mongoose.Schema.Types.ObjectId, ref:'movies'},
	movie_name: String,
	user_id: {type: mongoose.Schema.Types.ObjectId, ref:'users'},
	user_name: String,
	evaluate: String,
	sendDate: String
})

var evaluateModel = mongoose.model("evaluate", evaluate)
module.exports = evaluateModel
