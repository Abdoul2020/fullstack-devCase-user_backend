const AppError = require("../utils/appError");


const sendErrorDev = (err, res) => {

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';
  const stack = err.stack || '';

  res.status(statusCode).json({
    status,
    message,
    stack
  });

};

const sendErrorProd = (err, res) => {

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  if(err.isOperational){
    return res.status(statusCode).json({
      status,
      message,
    });
  }
  console.log(err.name, err.message, err.stack);
  return res.status(500).json({
    status:"error",
    message: 'Something went wrong',
  });

};

const globalErrorHandler = (err, req, res, next) => {

    if(err.name === 'JsonWebTokenError'){
      err=new AppError('Token is not valid', 400);
    }


    // handle sequelize validation error
    if(err.name === 'SequelizeValidationError'){
    err=new AppError(err.errors[0].message, 400);
  }

  // handle sequelize unique constraint error
  if(err.name === 'SequelizeUniqueConstraintError'){
    err=new AppError(err.errors[0].message, 400);
  }

  if(process.env.NODE_ENV === 'development'){
    return sendErrorDev(err, res);
  }

  return sendErrorProd(err, res);

  
};

module.exports = globalErrorHandler;