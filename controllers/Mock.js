// 模拟数据接口 Mockjs
const { body, check, checkSchema } = require("express-validator")
const { checkError, returnErr } = require("../utils/utils")
const Mock = require("mockjs")
const Random = Mock.Random
// 关于官网点击 登录 注册的模拟埋点数据
exports.mock_WebsiteClick = [
	(req, res, next) => {
		let arr = []
		let tempDate = "2023-02-0"
		for (let x = 1; x <= 6; x++) {
			let data = {
				id: Random.id(),
				date: `${tempDate}${x}`,
				ClickNum: Random.integer(100, 10000),
				LoginedNum: Random.integer(1, 100),
				registeiedNum: Random.integer(1, 50)
			}
			arr.push(data)
		}

		res.json({
			status: 0,
			data: arr
		})
	}
]
// 关于评论相关的埋点模拟数据
exports.mock_commentSend = [
	(req, res, next) => {
		let arr = []
		let tempDate = "2023-02-0"
		for (let x = 1; x <= 6; x++) {
			let data = {
				id: Random.id(),
				date: `${tempDate}${x}`,
				movieCommented: [],
				articleCommented: []
			}
			arr.push(data)
		}
		arr.forEach((temp) => {
			for (let x = 0; x <= Random.integer(5, 10); x++) {
				temp.movieCommented.push({
					movieId: Random.id(),
					movieName: Random.name(),
					Num: Random.integer(1, 100)
				})
				temp.articleCommented.push({
					articleId: Random.id(),
					articleTitle: Mock.mock("@ctitle"),
					Num: Random.integer(1, 100)
				})
			}
		})
		res.json({
			status: 0,
			data: arr
		})
	}
]
// 关于电影和文章点击相关的埋点模拟数据
exports.mock_click = [
	(req, res, next) => {
		let arr = []
		let tempDate = "2023-02-0"
		for (let x = 1; x <= 6; x++) {
			let data = {
				id: Random.id(),
				date: `${tempDate}${x}`,
				movieClick: [],
				articleClick: []
			}
			arr.push(data)
		}
		arr.forEach((temp) => {
			for (let x = 0; x <= Random.integer(5, 10); x++) {
				temp.movieClick.push({
					movieId: Random.id(),
					movieName: Random.name(),
					Num: Random.integer(1, 100)
				})
				temp.articleClick.push({
					articleId: Random.id(),
					articleTitle: Mock.mock("@ctitle"),
					Num: Random.integer(1, 100)
				})
			}
		})
		res.json({
			status: 0,
			data: arr
		})
	}
]
