// # Mongoose schema
import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      index: true
    },
    chapter: {
      type: String,
      required: [true, "Chapter name is required"],
      trim: true
    },
    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
      index: true
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true
    },
    yearWiseQuestionCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    questionSolved: {
      type: Number,
      required: [true, "Solved questions count is required"],
      min: [0, "Solved questions cannot be negative"],
      default: 0
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["Completed", "In Progress", "Not Started"],
        message: "Status must be: Completed, In Progress, or Not Started"
      },
      default: "Not Started"
    },
    isWeakChapter: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.yearWiseQuestionCount = Object.fromEntries(ret.yearWiseQuestionCount);
        return ret;
      }
    }
  }
);

// Indexes for frequently filtered fields
chapterSchema.index({ class: 1, subject: 1 });
chapterSchema.index({ status: 1, isWeakChapter: 1 });

export default mongoose.model("Chapter", chapterSchema);