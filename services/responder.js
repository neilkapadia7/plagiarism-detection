function success(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

function error(res, message, statusCode = 500, extra = {}) {
  return res.status(statusCode).json({ error: message, ...extra });
}

module.exports = { success, error };
