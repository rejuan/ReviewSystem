module.exports = function (req, res, next) {
    if(req.user.userType === 'admin') {
        next();
    } else {
        res.status(401).send("Access denied. You are not permitted");
    }
}