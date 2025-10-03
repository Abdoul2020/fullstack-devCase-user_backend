require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const cors = require('cors');
const authRouter = require('./route/authRoute');
const userRouter = require('./route/userRoute');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');


const app = express();

// CORS configuration - Accept all origins
const corsOptions = {
  origin: function (origin, callback) {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
    
    // Always allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`No origin provided, allowing request`);
      return callback(null, true);
    }
    
    // Development environment - accept all origins
    if (nodeEnv === 'development') {
      console.log(`Development mode: Allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Production environment
    if (nodeEnv === 'production') {
      // If ALLOWED_ORIGINS is not set or empty, allow all origins
      if (!allowedOriginsEnv || allowedOriginsEnv.trim() === '') {
        console.log(`Production mode: No ALLOWED_ORIGINS set, allowing all origins: ${origin}`);
        return callback(null, true);
      }
      
      // If ALLOWED_ORIGINS is set, parse and check
      try {
        const allowedOrigins = allowedOriginsEnv
          .split(',')
          .map(origin => origin.trim())
          .filter(origin => origin.length > 0);
        
        if (allowedOrigins.includes(origin)) {
          console.log(`Production mode: Allowing origin: ${origin}`);
          return callback(null, true);
        } else {
          console.log(`Production mode: Blocking origin: ${origin}`);
          return callback(new Error('Not allowed by CORS'));
        }
      } catch (error) {
        console.log(`Error parsing ALLOWED_ORIGINS, allowing origin: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Default fallback - allow all origins
    console.log(`Default mode: Allowing origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());//get the data from the body

// the route connection will be here
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);



app.use('/*any', catchAsync( async (req, res, next) => {
     throw new AppError(`can't find ${req.originalUrl} on the server`, 404);

}));

app.use(globalErrorHandler);


// initialize the port
const PORT = process.env.APP_PORT || 3001;

app.listen(PORT, () => {
    console.log('Server is running on PORT', PORT);
});
