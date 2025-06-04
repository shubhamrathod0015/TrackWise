// # Express setup

// app.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});