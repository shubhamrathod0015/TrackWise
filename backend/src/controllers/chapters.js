//  # Business logic

exports.uploadChapters = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const chapters = JSON.parse(file.buffer.toString());
    const results = await Chapter.insertMany(chapters, { ordered: false });
    
    // Invalidate Redis cache
    redis.del('__express__/api/v1/chapters');
    
    res.status(201).json({
      success: results.length,
      failed: chapters.length - results.length
    });
  } catch (err) {
    // Handle validation errors
    const failedDocs = err.writeErrors.map(e => e.err.op);
    res.status(207).json({ 
      success: err.insertedCount,
      failed: failedDocs
    });
  }
};

exports.getChapters = async (req, res) => {
  const { class: className, subject, unit, status, weakChapters, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (className) filter.class = className;
  if (subject) filter.subject = subject;
  if (unit) filter.unit = unit;
  if (status) filter.status = status;
  if (weakChapters) filter.weakChapters = weakChapters === 'true';

  const skip = (page - 1) * limit;
  
  const [chapters, total] = await Promise.all([
    Chapter.find(filter).skip(skip).limit(parseInt(limit)),
    Chapter.countDocuments(filter)
  ]);

  res.json({
    data: chapters,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};