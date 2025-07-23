import { Quiz } from '../models/Quiz.js';
import { Courses } from '../models/Courses.js';

// Admin: Add a new quiz to a specific course
export const addQuiz = async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;

    if (!courseId || !title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const course = await Courses.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const quiz = await Quiz.create({
      course: courseId,
      title,
      questions,
    });

    // Link quiz reference in course content array
    course.content.push({
      type: 'quiz',
      quizId: quiz._id,
    });
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Admin: Delete a quiz by ID
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    await quiz.deleteOne();

    // Remove quiz reference from course.content[]
    await Courses.updateOne(
      { _id: quiz.course },
      { $pull: { content: { type: 'quiz', quizId: quiz._id } } }
    );

    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// User: Get all quizzes by course ID (returns array of quizzes without correct answers)
export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ course: courseId }).lean();
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'No quizzes found' });
    }

    // Remove correctOptionIndex from each question in all quizzes
    const quizzesWithoutAnswers = quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz.questions.map(({ questionText, options }) => ({
        questionText,
        options,
      })),
    }));

    res.json({ success: true, quizzes: quizzesWithoutAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id).lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const quizWithoutAnswers = {
      ...quiz,
      questions: quiz.questions.map(({ questionText, options }) => ({
        questionText,
        options,
      })),
    };

    res.json({ success: true, quiz: quizWithoutAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// User: Submit quiz answers and get instant feedback
export const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quiz ID and answers array are required' 
      });
    }

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }

    let correctAnswers = 0;
    const detailedResults = quiz.questions.map((q, i) => {
      const userAnswer = answers[i];
      const isCorrect = userAnswer === q.correctOptionIndex;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: i,
        questionText: q.questionText,
        options: q.options,
        userAnswer,
        correctAnswer: q.correctOptionIndex,
        isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const passed = correctAnswers >= Math.ceil(totalQuestions / 2);

    res.status(200).json({
      success: true,
      score: correctAnswers,
      correctAnswers,
      totalQuestions,
      detailedResults,
      passed,
      message: passed ? "Quiz passed!" : "Quiz failed - try again!"
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
