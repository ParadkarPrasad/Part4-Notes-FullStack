const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
   response.status(404).send({ error: 'unknown endpoint' });
 };

 const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
    return res.status(400).json({error: 'expected `username` to be unique '})
  }
  next(error);
};

module.exports ={
  requestLogger,unknownEndpoint,errorHandler
}