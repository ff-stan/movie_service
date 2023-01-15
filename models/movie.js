var mongoose = require('../common/db')

//电影数据集
var movie = new mongoose.Schema({
    movieName: String,
    movieImg: String,
    movieVideo: String,
    movieCategory: String,
    movieArea:String,
    movieDuration:Number,
    movieContext: String,
    movieCastMembers:String,
    movieDownload: String,
    movieTime: String,
    movieNumSuppose: Number,
    movieNumDownload: Number,
    movieMainPage: Boolean
})

var movieModel = mongoose.model('movie',movie)
module.exports = movieModel
