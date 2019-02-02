
function getPageNumber(req) {
    if(req.query.pageNumber) {
        const pageNumber = parseInt(req.query.pageNumber);
        if (pageNumber < 1) {
            return 1;
        } else {
            return pageNumber;
        }
    } else {
        return 1;
    }
}

function getPageSize(req) {
    if(req.query.pageSize) {
        const pageSize = parseInt(req.query.pageSize);
        if (pageSize < 1) {
            return 1;
        } else {
            return pageSize;
        }
    } else {
        return 1;
    }
}

exports.getPageNumber = getPageNumber;
exports.getPageSize = getPageSize;