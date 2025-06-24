import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";


const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
const TiTick = () => "✓";
const TiPlus = () => "+";
const TiTrash = () => "🗑️";
const TiVideo = () => "▶️";
const TiDocument = () => "📄";
const TiUpload = () => "⬆️";
const TiArrowLeft = () => "←";
const TiPlay = () => "▶";

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="lecture-container">
      <style jsx>{`
        .lecture-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .progress-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          margin: 20px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .progress-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .progress-text {
          font-size: 16px;
          font-weight: 600;
          color: #e0e0e0;
        }

        .progress-percentage {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-bar-container {
          position: relative;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          border-radius: 10px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .lecture-main {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
          padding: 0 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .video-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .video-player {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .video-player video {
          width: 100%;
          height: auto;
          display: block;
        }

        .video-info h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          background: linear-gradient(45deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .video-info h3 {
          font-size: 16px;
          font-weight: 400;
          color: #b0b0b0;
          line-height: 1.6;
        }

        .no-video {
          text-align: center;
          padding: 80px 20px;
          color: #888;
        }

        .no-video-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .sidebar {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          height: fit-content;
          max-height: 80vh;
          overflow-y: auto;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .admin-controls {
          margin-bottom: 24px;
        }

        .add-lecture-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          padding: 14px 20px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .add-lecture-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        }

        .lecture-form {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lecture-form h2 {
          margin-bottom: 20px;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #e0e0e0;
          font-weight: 500;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .file-input {
          position: relative;
          overflow: hidden;
          display: inline-block;
          width: 100%;
        }

        .file-input input[type=file] {
          position: absolute;
          left: -9999px;
        }

        .file-input-label {
          background: rgba(255, 255, 255, 0.1);
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
        }

        .file-input-label:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .video-preview {
          margin-top: 16px;
          border-radius: 8px;
          overflow: hidden;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lectures-list {
          space-y: 8px;
        }

        .lecture-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .lecture-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .lecture-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-color: #6366f1;
        }

        .lecture-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .lecture-title {
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lecture-number {
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .completed-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 4px 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          font-size: 12px;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          width: 100%;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .no-lectures {
          text-align: center;
          padding: 40px 20px;
          color: #888;
        }

        @media (max-width: 1024px) {
          .lecture-main {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .sidebar {
            order: -1;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .progress-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .lecture-main {
            padding: 0 10px;
          }
          
          .video-section,
          .sidebar {
            padding: 20px;
          }
        }
      `}</style>

      {/* Progress Header */}
      <div className="progress-header">
        <div className="progress-stats">
          <div className="progress-text">
            {completedLec} of {lectLength} lectures completed
          </div>
          <div className="progress-percentage">{completed}%</div>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${completed}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lecture-main">
        {/* Video Section */}
        <div className="video-section">
          {lecLoading ? (
            <Loading />
          ) : (
            <>
              {lecture.video ? (
                <>
                  <div className="video-player">
                    <video
                      src={`${server}/${lecture.video}`}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      autoPlay
                      onEnded={() => addProgress(lecture._id)}
                    />
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
                  <h2>Select a lecture to start learning</h2>
                  <p>Choose from the lecture list to begin watching</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Admin Controls */}
          {user && user.role === "admin" && (
            <div className="admin-controls">
              <button 
                className="add-lecture-btn" 
                onClick={() => setShow(!show)}
              >
                {show ? <TiArrowLeft /> : <TiPlus />}
                {show ? "Close Form" : "Add New Lecture"}
              </button>
            </div>
          )}

          {/* Add Lecture Form */}
          {show && (
            <div className="lecture-form">
              <h2>Add New Lecture</h2>
              <form onSubmit={submitHandler}>
                <div className="form-group">
                  <label htmlFor="title">Lecture Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter lecture title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter lecture description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Video File</label>
                  <div className="file-input">
                    <input
                      type="file"
                      id="video-file"
                      onChange={changeVideoHandler}
                      accept="video/*"
                      required
                    />
                    <label htmlFor="video-file" className="file-input-label">
                      <TiUpload size={24} />
                      <div>Click to upload video</div>
                      <small>MP4, MOV, AVI supported</small>
                    </label>
                  </div>
                </div>

                {videoPrev && (
                  <div className="video-preview">
                    <video src={videoPrev} width="100%" controls />
                  </div>
                )}

                <button
                  disabled={btnLoading}
                  type="submit"
                  className="submit-btn"
                >
                  {btnLoading ? "Uploading..." : "Add Lecture"}
                </button>
              </form>
            </div>
          )}

          {/* Lectures List */}
          <div className="lectures-list">
            {lectures && lectures.length > 0 ? (
              lectures.map((e, i) => (
                <div key={i}>
                  <div
                    onClick={() => fetchLecture(e._id)}
                    className={`lecture-item ${
                      lecture._id === e._id ? "active" : ""
                    }`}
                  >
                    <div className="lecture-header">
                      <div className="lecture-title">
                        <span className="lecture-number">{i + 1}</span>
                        <TiPlay size={16} />
                        {e.title}
                      </div>
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <div className="completed-badge">
                            <TiTick size={14} />
                          </div>
                        )}
                    </div>
                  </div>
                  {user && user.role === "admin" && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteHandler(e._id)}
                    >
                      <TiTrash size={14} style={{ marginRight: '4px' }} />
                      Delete "{e.title}"
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="no-lectures">
                <TiDocument size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p>No lectures available yet</p>
                {user && user.role === "admin" && (
                  <p>Add your first lecture to get started</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecture;