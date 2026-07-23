export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;

  const stack = err.stack || new Error(err.message || 'Server Error').stack;

  console.error('Error handler caught an error:');
  console.error(stack);

  const origin = req.headers.origin;
  const allowedOrigins = [
    ...(process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()).filter(Boolean) || []),
    ...(process.env.NODE_ENV === 'production' ? ['https://sambx.vercel.app'] : []),
  ];

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : stack,
  });
}
