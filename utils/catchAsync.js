// this is a middleware to handle the errors
const catchAsync = (fn) => {
  const errorHandler = (req, res, next) => {
    fn(req, res, next).catch(next);
  };
  return errorHandler;
};

module.exports = catchAsync;
