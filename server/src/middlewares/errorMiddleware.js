const errorMiddleware = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ status: false, message: "File size exceeds the 2MB limit!" });
  }
  const status = err.code && err.meta && err.meta.target ? 400 : 500;
  const message = err.message || "Internal Server Error!";

  res.status(status).json({ status: false, message });
};

module.exports = errorMiddleware;
