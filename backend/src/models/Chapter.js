// # Mongoose schema

const chapterSchema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  unit: { type: String, required: true },
  chapterName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'in-progress'],
    default: 'pending'
  },
  weakChapters: { type: Boolean, default: false }
});

module.exports = mongoose.model('Chapter', chapterSchema);