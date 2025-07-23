import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comingSoon: {
    type: Boolean,
    default: false,
  },

  content: [
    {
      type: {
        type: String,
        enum: ["lecture", "quiz"],
        required: true,
      },
      lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    },
  ],
});

export const Courses = mongoose.model("Courses", schema);
