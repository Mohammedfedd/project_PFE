import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import "./lecture.css";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // Quiz form states
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: null,
    },
  ]);
  const [quizBtnLoading, setQuizBtnLoading] = useState(false);

  // Interactive quiz states
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizMode, setQuizMode] = useState('all-at-once');

  const params = useParams();
  const navigate = useNavigate();

  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [autoProgressCountdown, setAutoProgressCountdown] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // Progress states
  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
 const [generatingCert, setGeneratingCert] = useState(false);
const [certError, setCertError] = useState(null);
const [certificateUrl, setCertificateUrl] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`certificate_${params.id}`) || null;
  }
  return null;
});


  // Icon shortcuts
  const TiTick = () => "✓";
  const TiPlus = () => "+";
  const TiTrash = () => "🗑️";
  const TiVideo = () => "▶️";
  const TiArrowLeft = () => "←";
  const TiPlay = () => "▶";

 useEffect(() => {
  if (user) {
    const isAuthorized = 
      user.role === "admin" || 
      user.role === "superadmin" || 
      user.subscription.includes(params.id);
    
    if (!isAuthorized) {
      navigate("/");
    }
  }
}, [user, params.id, navigate]);

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function fetchQuizzes() {
    try {
      const { data } = await axios.get(`${server}/api/user/quiz/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error(error);
      setQuizzes([]);
    }
  }

 async function fetchProgress() {
  try {
    const { data } = await axios.get(
      `${server}/api/user/progress?course=${params.id}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        }
      }
    );

    if (data.success) {
      const totalLectures = data.allLectures?.length || 0;
      const totalQuizzes = data.allQuizzes?.length || 0;
      const totalItems = totalLectures + totalQuizzes;

      const completedLectures = data.completedLectures?.length || 0;
      const completedQuizzes = data.completedQuizzes?.length || 0;
      const completedItems = completedLectures + completedQuizzes;

      const percentage = totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;

      setCompleted(percentage);
      setCompletedLec(completedItems);  
      setLectLength(totalItems);        
      setProgress(data.progress);
    } else {
      console.error("Progress fetch failed:", data.message);
      setCompleted(0);
      setCompletedLec(0);
      setLectLength(0);
      setProgress([]);
    }
  } catch (error) {
    console.error("Progress fetch error:", error.stack || error.message);
    setCompleted(0);
    setCompletedLec(0);
    setLectLength(0);
    setProgress([]);
  }
}


  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  async function fetchLecture(id) {
    setLecLoading(true);
    setIsVideoCompleted(false);
    setShowCompletionMessage(false);
    setAutoProgressCountdown(0);
    setShowQuiz(false);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setLecture(data.lecture);
      setQuizData(null);
      const index = lectures.findIndex((l) => l._id === id);
      setCurrentLectureIndex(index);
      setLecLoading(false);
    } catch (error) {
      console.error(error);
      setLecLoading(false);
    }
  }

  async function fetchQuiz(id) {
    setLecLoading(true);
    setIsVideoCompleted(false);
    setShowCompletionMessage(false);
    setAutoProgressCountdown(0);
    setShowQuiz(true);
    
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setCurrentQuestionIndex(0);
    
    try {
      const { data } = await axios.get(`${server}/api/quiz/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setQuizData(data.quiz);
      setLecture(null);
      setLecLoading(false);
    } catch (error) {
      console.error(error);
      setLecLoading(false);
    }
  }

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };
  const handleGenerateCertificate = async () => {
  setGeneratingCert(true);
  setCertError(null);
  try {
    const { data } = await axios.post(
      `${server}/api/user/generate-certificate`,
      { courseId: params.id },
      { 
        headers: { 
          'Content-Type': 'application/json',
          token: localStorage.getItem("token") 
        } 
      }
    );

    if (!data.success) {
      throw new Error(data.message || "Certificate generation failed");
    }

    // Store in both state and localStorage
    localStorage.setItem(`certificate_${params.id}`, data.certificateUrl);
    setCertificateUrl(data.certificateUrl);
    window.open(`${server}${data.certificateUrl}`, '_blank');
    toast.success("Certificate generated successfully!");

  } catch (error) {
    console.error("Certificate generation error:", error);
    setCertError(
      error.response?.data?.message || 
      error.message || 
      "Failed to generate certificate. Please try again later."
    );
  } finally {
    setGeneratingCert(false);
  }
};

const submitQuiz = async () => {
  if (!quizData || quizSubmitted) return;

  const totalQuestions = quizData.questions.length;
  const answeredQuestions = Object.keys(userAnswers).length;

  if (answeredQuestions < totalQuestions) {
    toast.error(`Please answer all questions. ${answeredQuestions}/${totalQuestions} answered.`);
    return;
  }

  setQuizBtnLoading(true);

  try {
    // 1. Submit the quiz answers
    const answersArray = quizData.questions.map((_, index) => userAnswers[index] ?? null);

    const { data } = await axios.post(
      `${server}/api/user/quiz/submit`,
      {
        quizId: quizData._id,
        answers: answersArray
      },
      {
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem("token")
        }
      }
    );

    if (data.success) {
      // 2. Only mark quiz as completed if passed
      if (data.passed) {
        await axios.post(
          `${server}/api/user/progress?course=${params.id}&quizId=${quizData._id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token")
            }
          }
        );
      }

      // 3. Update UI with results
      setQuizResults({
        score: data.correctAnswers,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
        detailedResults: data.detailedResults,
        passed: data.passed
      });
      setQuizSubmitted(true);
      toast.success(data.message);

      // 4. Refresh progress
      fetchProgress();
    } else {
      toast.error(data.message || "Quiz submission failed");
    }
  } catch (error) {
    console.error('Submission error:', error);
    toast.error(error.response?.data?.message || "Error submitting quiz");
  } finally {
    setQuizBtnLoading(false);
  }
};

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setCurrentQuestionIndex(0);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setVideo(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success(data.message);
      setBtnLoading(false);
      setShowLectureForm(false);
      fetchLectures();
      fetchProgress();
      setTitle("");
      setDescription("");
      setVideo(null);
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lecture upload failed");
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: { token: localStorage.getItem("token") },
        });
        toast.success(data.message);
        fetchLectures();
        fetchProgress();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const deleteQuizHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const { data } = await axios.delete(`${server}/api/admin/quiz/${id}`, {
          headers: { token: localStorage.getItem("token") },
        });
        toast.success(data.message);
        fetchQuizzes();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleVideoEnd = async () => {
  if (!lecture) return;
  
  // Add progress when video ends
  await addProgress(lecture._id);
  
  setIsVideoCompleted(true);
  setShowCompletionMessage(true);

  const orderedContent = getOrderedContent();
  const currentIndex = orderedContent.findIndex(item => 
    item.type === 'lecture' && item._id === lecture._id
  );

  // Only show countdown if not at 100% progress
  if (currentIndex < orderedContent.length - 1 && completed < 100) {
    let countdown = 10;
    setAutoProgressCountdown(countdown);

    const interval = setInterval(() => {
      countdown--;
      setAutoProgressCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(interval);
        if (orderedContent[currentIndex + 1].type === 'lecture') {
          fetchLecture(orderedContent[currentIndex + 1]._id);
        } else {
          fetchQuiz(orderedContent[currentIndex + 1]._id);
        }
      }
    }, 1000);

    window.autoProgressInterval = interval;
  } else if (completed >= 100) {
    toast.success("🎉 Course completed!");
  }
};

  const cancelAutoProgress = () => {
    if (window.autoProgressInterval) {
      clearInterval(window.autoProgressInterval);
      setAutoProgressCountdown(0);
      setShowCompletionMessage(false);
    }
  };

  const goToNextLecture = () => {
  const orderedContent = getOrderedContent();
  const currentIndex = orderedContent.findIndex(item => 
    (item.type === 'lecture' && item._id === lecture?._id) || 
    (item.type === 'quiz' && item._id === quizData?._id)
  );

  if (currentIndex < orderedContent.length - 1) {
    cancelAutoProgress();
    const nextItem = orderedContent[currentIndex + 1];
    if (nextItem.type === 'lecture') {
      fetchLecture(nextItem._id);
    } else {
      fetchQuiz(nextItem._id);
    }
  } else if (completed >= 100) {
    toast.success("🎉 Course completed!");
  }
};

  const updateQuestionText = (index, text) => {
    const copy = [...questions];
    copy[index].questionText = text;
    setQuestions(copy);
  };

  const updateOptionText = (qIndex, oIndex, text) => {
    const copy = [...questions];
    copy[qIndex].options[oIndex] = text;
    setQuestions(copy);
  };

  const updateCorrectOptionIndex = (qIndex, index) => {
    const copy = [...questions];
    copy[qIndex].correctOptionIndex = index;
    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctOptionIndex: null },
    ]);
  };

  const submitQuizHandler = async (e) => {
    e.preventDefault();

    if (!quizTitle.trim()) {
      toast.error("Quiz title is required.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question #${i + 1} is required.`);
        return;
      }
      if (q.options.length < 2 || q.options.length > 4) {
        toast.error(`Question #${i + 1} must have between 2 and 4 options.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Option ${j + 1} in Question #${i + 1} is required.`);
          return;
        }
      }
      if (
        q.correctOptionIndex === null ||
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        toast.error(`Please select a valid correct answer for Question #${i + 1}.`);
        return;
      }
    }

    setQuizBtnLoading(true);

    const questionsPayload = questions.map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((opt) => ({ text: opt.trim() })),
      correctOptionIndex: q.correctOptionIndex,
    }));

    try {
      const { data } = await axios.post(
        `${server}/api/admin/quiz/new`,
        {
          courseId: params.id,
          title: quizTitle.trim(),
          questions: questionsPayload,
        },
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      toast.success(data.message || "Quiz created successfully");
      setShowQuizForm(false);
      setQuizTitle("");
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctOptionIndex: null }]);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Quiz creation failed");
    } finally {
      setQuizBtnLoading(false);
    }
  };

  const renderInteractiveQuiz = () => {
    if (!quizData) return null;

    const renderOption = (question, qIndex, option, oIndex) => {
      const isUserSelection = userAnswers[qIndex] === oIndex;
      const isSubmitted = quizSubmitted;
      let isCorrectAnswer = false;
      
      if (isSubmitted && quizResults?.detailedResults?.[qIndex]) {
        isCorrectAnswer = oIndex === quizResults.detailedResults[qIndex].correctAnswer;
      } else {
        isCorrectAnswer = oIndex === question.correctOptionIndex;
      }

      let backgroundColor = "white";
      let borderColor = "#ddd";
      let indicator = null;

      if (isSubmitted) {
        if (isCorrectAnswer) {
          backgroundColor = "#d4edda";
          borderColor = "#28a745";
          indicator = <span style={{ marginLeft: "auto", color: "#28a745", fontWeight: "bold" }}>✓</span>;
        }
        else if (isUserSelection) {
          backgroundColor = "#f8d7da";
          borderColor = "#dc3545";
          indicator = <span style={{ marginLeft: "auto", color: "#dc3545", fontWeight: "bold" }}>✗</span>;
        }
      } else {
        if (isUserSelection) {
          backgroundColor = "#e3f2fd";
          borderColor = "#2196f3";
        }
      }

      return (
        <div
          key={oIndex}
          className="quiz-option"
          style={{
            marginBottom: "10px",
            padding: "10px",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            cursor: isSubmitted ? "default" : "pointer",
            backgroundColor,
            transition: "all 0.3s ease"
          }}
          onClick={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
        >
          <label style={{ 
            cursor: isSubmitted ? "default" : "pointer", 
            display: "flex", 
            alignItems: "center", 
            width: "100%" 
          }}>
            <input
              type="radio"
              name={`question-${qIndex}`}
              checked={isUserSelection}
              onChange={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
              disabled={isSubmitted}
              style={{ marginRight: "10px" }}
            />
            <span style={{ color: "#333", flex: 1 }}>{option.text}</span>
            {indicator}
          </label>
        </div>
      );
    };

    return (
      <div className="quiz-container">
        <div className="quiz-header" style={{
          background: "linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%)",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ 
            color: "white", 
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
          }}>
            {quizData.title}
          </h2>
          <div className="quiz-progress" style={{ 
            color: "rgba(255,255,255,0.9)", 
            marginTop: "8px",
            fontSize: "16px"
          }}>
            Question {Object.keys(userAnswers).length}/{quizData.questions.length} answered
          </div>
        </div>

        <div className="quiz-mode-toggle" style={{ marginBottom: "20px", textAlign: "center" }}>
          <button
            onClick={() => setQuizMode('all-at-once')}
            style={{
              backgroundColor: quizMode === 'all-at-once' ? '#007bff' : '#f8f9fa',
              color: quizMode === 'all-at-once' ? 'white' : '#333',
              border: '1px solid #ddd',
              padding: '8px 16px',
              marginRight: '10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            All Questions
          </button>
          <button
            onClick={() => setQuizMode('one-by-one')}
            style={{
              backgroundColor: quizMode === 'one-by-one' ? '#007bff' : '#f8f9fa',
              color: quizMode === 'one-by-one' ? 'white' : '#333',
              border: '1px solid #ddd',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            One by One
          </button>
        </div>

        {quizMode === 'all-at-once' ? (
          <div className="quiz-all-questions">
            {quizData.questions.map((question, qIndex) => (
              <div key={qIndex} className="quiz-question" style={{ 
                marginBottom: "30px", 
                padding: "20px", 
                border: "1px solid #ddd", 
                borderRadius: "8px",
                backgroundColor: userAnswers[qIndex] !== undefined ? "#f8f9fa" : "white"
              }}>
                <h4 style={{ marginBottom: "15px", color: "#333" }}>
                  {qIndex + 1}. {question.questionText}
                </h4>
                <div className="quiz-options">
                  {question.options.map((option, oIndex) => 
                    renderOption(question, qIndex, option, oIndex)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="quiz-one-by-one">
            <div className="question-navigation" style={{ marginBottom: "20px", textAlign: "center" }}>
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  backgroundColor: currentQuestionIndex === 0 ? "#f8f9fa" : "#007bff",
                  color: currentQuestionIndex === 0 ? "#6c757d" : "white",
                  border: "1px solid #ddd",
                  padding: "8px 16px",
                  marginRight: "10px",
                  borderRadius: "4px",
                  cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>
              <span style={{ margin: "0 20px", fontWeight: "bold", color: "#333" }}>
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === quizData.questions.length - 1}
                style={{
                  backgroundColor: currentQuestionIndex === quizData.questions.length - 1 ? "#f8f9fa" : "#007bff",
                  color: currentQuestionIndex === quizData.questions.length - 1 ? "#6c757d" : "white",
                  border: "1px solid #ddd",
                  padding: "8px 16px",
                  marginLeft: "10px",
                  borderRadius: "4px",
                  cursor: currentQuestionIndex === quizData.questions.length - 1 ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>

            {quizData.questions[currentQuestionIndex] && (
              <div className="current-question" style={{ 
                padding: "20px", 
                border: "1px solid #ddd", 
                borderRadius: "8px",
                backgroundColor: "white"
              }}>
                <h4 style={{ marginBottom: "15px", color: "#333" }}>
                  {currentQuestionIndex + 1}. {quizData.questions[currentQuestionIndex].questionText}
                </h4>
                <div className="quiz-options">
                  {quizData.questions[currentQuestionIndex].options.map((option, oIndex) => 
                    renderOption(quizData.questions[currentQuestionIndex], currentQuestionIndex, option, oIndex)
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {quizResults && (
          <div className="quiz-results" style={{ 
            marginTop: "30px", 
            padding: "20px", 
            border: `2px solid ${quizResults.passed ? "#28a745" : "#dc3545"}`, 
            borderRadius: "8px",
            backgroundColor: "#f8f9fa"
          }}>
            <h3 style={{ 
              color: quizResults.passed ? "#28a745" : "#dc3545", 
              marginBottom: "15px" 
            }}>
              {quizResults.passed ? "Quiz Passed!" : "Quiz Failed"}
            </h3>
            <div style={{ marginBottom: "10px", color: "#333" }}>
              <strong>Correct Answers: {quizResults.correctAnswers} out of {quizResults.totalQuestions}</strong>
            </div>
            <div style={{ marginBottom: "10px", color: "#333" }}>
              Passing Requirement: {Math.ceil(quizResults.totalQuestions / 2)} correct answers
            </div>
            <div style={{ color: "#333" }}>
              Status: <span style={{ 
                color: quizResults.passed ? "#28a745" : "#dc3545",
                fontWeight: "bold"
              }}>
                {quizResults.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>
        )}

        <div className="quiz-actions" style={{ marginTop: "30px", textAlign: "center" }}>
  {!quizSubmitted ? (
    <button
      onClick={submitQuiz}
      disabled={quizBtnLoading || Object.keys(userAnswers).length !== quizData.questions.length}
      style={{
        backgroundColor: Object.keys(userAnswers).length === quizData.questions.length ? "#28a745" : "#6c757d",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "4px",
        cursor: Object.keys(userAnswers).length === quizData.questions.length ? "pointer" : "not-allowed",
        fontSize: "16px",
        fontWeight: "bold",
        opacity: Object.keys(userAnswers).length === quizData.questions.length ? 1 : 0.7
      }}
    >
      {quizBtnLoading ? "Submitting..." : "Submit Quiz"}
    </button>
  ) : (
    <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
      <button
        onClick={resetQuiz}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          flex: 1,
          maxWidth: "200px"
        }}
      >
        Take Quiz Again
      </button>
      <button
        onClick={goToNextLecture}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          flex: 1,
          maxWidth: "200px"
        }}
      >
        Next Content
      </button>
    </div>
  )}
</div>
      </div>
    );
  };
  const getOrderedContent = () => {
    if (!lectures || !quizzes) return [];
    
    const combined = [
      ...lectures.map(l => ({ ...l, type: 'lecture' })),
      ...quizzes.map(q => ({ ...q, type: 'quiz' }))
    ];
    
    return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  useEffect(() => {
    fetchLectures();
    fetchQuizzes();
    fetchProgress();
    return () => {
      if (window.autoProgressInterval) clearInterval(window.autoProgressInterval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (window.autoProgressInterval) clearInterval(window.autoProgressInterval);
    };
  }, [lecture?._id]);

  return (
    <div className="lecture-container">
      {/* Progress Bar */}
      <div className="progress" style={{
        background: "#fff",
        padding: "15px 20px",
        marginBottom: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "10px", color: "#333", fontWeight: "500" }}>
          Course Progress - {completedLec} out of {lectLength}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <progress 
            value={completed} 
            max={100}
            style={{
              flex: 1,
              height: "8px",
              borderRadius: "4px",
              appearance: "none",
              WebkitAppearance: "none"
            }}
          />
          <span style={{ color: "#6e48aa", fontWeight: "bold", fontSize: "16px" }}>
            {completed}%
          </span>
        </div>
      </div>

      <div className="lecture-main">
        <div className="video-section">
          {lecLoading ? (
            <Loading />
          ) : showQuiz && quizData ? (
            renderInteractiveQuiz()
          ) : lecture && lecture.video ? (
            <>
              <div className="video-player">
                <video
                  src={`${server}/${lecture.video}`}
                  controls
                  autoPlay
                  onEnded={handleVideoEnd}
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                />
              {showCompletionMessage && (
  <div className="video-completion-overlay">
    <div className="completion-content">
      <div className="completion-checkmark">✓</div>
      <h3 className="completion-title">Lecture Completed!</h3>
      
      {completed >= 100 ? (
        <>
          <p className="completion-subtitle">Congratulations! You've completed the course!</p>
          
          {certError && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '4px',
              margin: '10px 0',
              border: '1px solid #f5c6cb'
            }}>
              {certError}
            </div>
          )}

          {certificateUrl ? (
  <div style={{ margin: '15px 0' }}>
    <button
      onClick={() => window.open(`${server}${certificateUrl}`, '_blank')}
      style={{
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        margin: '5px'
      }}
    >
      View Certificate
    </button>
  </div>
) : (
  <div className="progress-actions">
    <button
      className="certificate-btn"
      onClick={handleGenerateCertificate}
      disabled={generatingCert}
      style={{
        backgroundColor: generatingCert ? '#6c757d' : '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: generatingCert ? 'not-allowed' : 'pointer',
        margin: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {generatingCert ? (
        <>
          <Loading size="small" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span>Get Your Certificate</span>
        </>
      )}
    </button>
  </div>
)}
        </>
      ) : (
        <>
          <p className="completion-subtitle">Great job finishing this content</p>
          {autoProgressCountdown > 0 && (
            <div className="auto-progress-notice">
              <p>Next content in</p>
              <div className="countdown-timer">{autoProgressCountdown}</div>
            </div>
          )}
          <div className="progress-actions">
            <button className="next-btn" onClick={goToNextLecture}>Start Next</button>
            <button className="cancel-btn" onClick={cancelAutoProgress}>Stay Here</button>
          </div>
        </>
      )}
    </div>
  </div>
)}
              </div>
              <div className="video-info">
                <h1>{lecture.title}</h1>
                <h3>{lecture.description}</h3>
              </div>
            </>
          ) : (
            <div className="no-video">
              <div className="no-video-icon">
                <TiVideo />
              </div>
              <h2>Select a lecture or quiz to start learning</h2>
            </div>
          )}
        </div>

        <div className="sidebar">
          {(user?.role === "admin" || user?.role === "superadmin") && ( 
            <>
              <button
                className="add-lecture-btn"
                onClick={() => setShowLectureForm(!showLectureForm)}
              >
                {showLectureForm ? <TiArrowLeft /> : <TiPlus />}{" "}
                {showLectureForm ? "Close Form" : "Add Lecture"}
              </button>
              <button
                className="add-lecture-btn"
                onClick={() => setShowQuizForm(!showQuizForm)}
              >
                {showQuizForm ? <TiArrowLeft /> : <TiPlus />}{" "}
                {showQuizForm ? "Close Quiz Form" : "Add Quiz"}
              </button>
            </>
          )}

          {showLectureForm && (
  <div className="lecture-form" style={{
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  }}>
    <h2 style={{
      color: "#2c3e50",
      marginBottom: "20px",
      fontSize: "22px",
      fontWeight: "600",
      textAlign: "center"
    }}>Add New Lecture</h2>
    <form onSubmit={submitHandler} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <div className="form-group">
        <label style={{
          display: "block",
          marginBottom: "8px",
          color: "#555",
          fontWeight: "500"
        }}>Lecture Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lecture title"
          required
          style={{
            width: "100%",
            padding: "12px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "border 0.3s",
            outline: "none",
            color: "#333",
            backgroundColor: "#fff"
          }}
        />
      </div>

      <div className="form-group">
        <label style={{
          display: "block",
          marginBottom: "8px",
          color: "#555",
          fontWeight: "500"
        }}>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter lecture description"
          required
          style={{
            width: "100%",
            padding: "12px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "border 0.3s",
            outline: "none",
            color: "#333",
            backgroundColor: "#fff"
          }}
        />
      </div>

      <div className="form-group">
        <label style={{
          display: "block",
          marginBottom: "8px",
          color: "#555",
          fontWeight: "500"
        }}>Video File</label>
        <div style={{
          border: "2px dashed #ddd",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.3s",
          ":hover": {
            borderColor: "#6e48aa"
          }
        }}>
          <input
            type="file"
            onChange={changeVideoHandler}
            accept="video/*"
            required
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "0",
              left: "0",
              opacity: "0",
              cursor: "pointer"
            }}
          />
          <div style={{ fontSize: "48px", color: "#6e48aa", marginBottom: "10px" }}>
            <TiVideo />
          </div>
          <p style={{ color: "#777", marginBottom: "5px" }}>
            {video ? video.name : "Click to select video"}
          </p>
          <p style={{ color: "#aaa", fontSize: "14px" }}>
            MP4, WebM or MOV (max. 100MB)
          </p>
        </div>
      </div>

      {videoPrev && (
        <div style={{
          marginTop: "10px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <video src={videoPrev} width="100%" controls style={{ display: "block" }} />
        </div>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={btnLoading}
        style={{
          backgroundColor: "#6e48aa",
          color: "white",
          border: "none",
          padding: "14px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.3s",
          marginTop: "10px",
          ":hover": {
            backgroundColor: "#5d3a9a",
            transform: "translateY(-2px)"
          },
          ":disabled": {
            backgroundColor: "#aaa",
            cursor: "not-allowed",
            transform: "none"
          }
        }}
      >
        {btnLoading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ marginRight: "8px" }}>Uploading...</span>
            <Loading size="small" />
          </span>
        ) : (
          "Add Lecture"
        )}
      </button>
    </form>
  </div>
)}

{showQuizForm && (
  <div className="lecture-form" style={{
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  }}>
    <h2 style={{
      color: "#2c3e50",
      marginBottom: "20px",
      fontSize: "22px",
      fontWeight: "600",
      textAlign: "center"
    }}>Create New Quiz</h2>
    <form onSubmit={submitQuizHandler} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="form-group">
        <label style={{
          display: "block",
          marginBottom: "8px",
          color: "#555",
          fontWeight: "500"
        }}>Quiz Title</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
          required
          style={{
            width: "100%",
            padding: "12px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "border 0.3s",
            outline: "none",
            color: "#333",
            backgroundColor: "#fff"
          }}
        />
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              backgroundColor: "#fafafa"
            }}
          >
            <div className="form-group">
              <label style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontWeight: "500"
              }}>Question #{qIndex + 1}</label>
              <input
                type="text"
                value={q.questionText}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                placeholder={`Enter question #${qIndex + 1}`}
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border 0.3s",
                  outline: "none",
                  color: "#333",
                  backgroundColor: "#fff"
                }}
              />
            </div>

            <div style={{ marginTop: "15px" }}>
              <label style={{
                display: "block",
                marginBottom: "12px",
                color: "#555",
                fontWeight: "500"
              }}>Options</label>

              {q.options.map((opt, oIndex) => (
  <div key={oIndex} style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px"
  }}>
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      border: q.correctOptionIndex === oIndex ? "5px solid #6e48aa" : "2px solid #aaa",
      backgroundColor: "#fff",
      cursor: "pointer",
      flexShrink: 0
    }}>
      <input
        type="radio"
        name={`correctOption-${qIndex}`}
        checked={q.correctOptionIndex === oIndex}
        onChange={() => updateCorrectOptionIndex(qIndex, oIndex)}
        required
        style={{
          width: "100%",
          height: "100%",
          cursor: "pointer",
          margin: 0,
          opacity: 0
        }}
      />
    </div>
    <input
      type="text"
      value={opt}
      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
      placeholder={`Option ${oIndex + 1}`}
      required
      style={{
        flex: "1",
        padding: "10px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "15px",
        outline: "none",
        color: "#333",
        backgroundColor: "#fff"
      }}
    />
  </div>
))}

            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          type="button"
          className="add-question-btn"
          onClick={addQuestion}
          style={{
            flex: "1",
            backgroundColor: "#f0f0f0",
            color: "#555",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <TiPlus /> Add Another Question
        </button>

        <button
          type="submit"
          disabled={quizBtnLoading}
          style={{
            flex: "1",
            backgroundColor: "#6e48aa",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
        >
          {quizBtnLoading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ marginRight: "8px" }}>Creating...</span>
              <Loading size="small" />
            </span>
          ) : (
            "Create Quiz"
          )}
        </button>
      </div>
    </form>
  </div>
)}

          <div className="lectures-list">
            <h3>Course Content</h3>
           
{getOrderedContent().map((item, i) => (
  <div key={item._id} style={{ marginBottom: "10px" }}>
          <div
        className={`content-item ${
          (lecture?._id === item._id && !showQuiz) || 
          (quizData?._id === item._id && showQuiz) ? "active" : ""
        }`}
        onClick={() => {
          cancelAutoProgress();
          if (item.type === 'lecture') {
            fetchLecture(item._id);
            setShowQuiz(false);
          } else {
            fetchQuiz(item._id);
          }
        }}
        style={{
          cursor: "pointer",
          padding: "6px 10px",
          backgroundColor:
            (lecture?._id === item._id && !showQuiz) || 
            (quizData?._id === item._id && showQuiz) ? "#eee" : "transparent",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeft: item.type === 'quiz' ? "4px solid #6e48aa" : "4px solid #28a745"
        }}
      >
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {i + 1}. {item.title}
          {(item.type === 'lecture' && progress?.completedLectures?.includes(item._id)) || 
          (item.type === 'quiz' && progress?.completedQuizzes?.includes(item._id)) ? (
            <span
              style={{
                background: "#28a745",
                padding: "2px 6px",
                borderRadius: "6px",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              ✓
            </span>
          ) : null}
      </span>
      {(user?.role === "admin" || user?.role === "superadmin") && (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            if (item.type === 'lecture') {
              deleteHandler(item._id);
            } else {
              deleteQuizHandler(item._id);
            }
          }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "red",
            fontSize: "16px",
          }}
          title={`Delete ${item.type === 'quiz' ? 'Quiz' : 'Lecture'}`}
        >
          🗑️
        </button>
      )}
    </div>
  </div>
))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecture;