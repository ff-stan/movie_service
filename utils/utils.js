const { validationResult } = require("express-validator")
// 检测数据是否通过合格
exports.checkError = function (req, res) {
    //验证请求的所有数据
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 1,
            errors: errors.array()
        })
    }
}


// 当查询出现错误时返回错误结果
exports.returnErr = function (res, err, next, errMsg, errStatus) {
    res.status(errStatus || 500).json({
        status: 1,
        message: errMsg || "数据出错,请联系管理员更新数据",
        err: err
    })
    next(err)
}