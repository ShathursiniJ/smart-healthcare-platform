const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate entry.' });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error.' });
};

export default errorHandler;
