import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function (v) {
        return v.length >= 2 && v.length <= 4;
      },
      message: 'Each question must have between 2 and 4 options.',
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0 && v < 4;
      },
      message: 'Correct option index must be between 0 and 3.',
    },
  },
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = mongoose.model('Quiz', quizSchema);
