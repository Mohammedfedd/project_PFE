import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./educators.css";

const Educators = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEducators = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/educators`);
      setEducators(Array.isArray(data.educators) ? data.educators : []);
    } catch (error) {
      toast.error("Failed to load educators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducators();
  }, []);

  const filteredEducators = educators.filter((edu) => {
    const search = searchTerm.toLowerCase();
    return (
      edu.firstName.toLowerCase().includes(search) ||
      edu.lastName.toLowerCase().includes(search) ||
      edu.email.toLowerCase().includes(search)
    );
  });

  return (
    <div className="educators-container">
      <h1>Meet Our Educators</h1>
      <p>
        Our dedicated team is here to help you succeed. Feel free to reach out to any of them for guidance or questions.
      </p>

      <input
        type="text"
        placeholder="Search educators by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="educators-search-input"
      />

      {loading ? (
        <p>Loading educators...</p>
      ) : filteredEducators.length === 0 ? (
        <p>No educators found.</p>
      ) : (
        <div className="educators-list">
          {filteredEducators.map((edu) => (
            <div key={edu._id} className="educator-card">
              <img
                src={edu.profilePicture || "/default-profile.png"}
                alt={`${edu.firstName} ${edu.lastName}`}
                className="educator-photo"
              />
              <h3>{edu.firstName} {edu.lastName}</h3>
              {edu.title && <p className="educator-title">{edu.title}</p>}
              {edu.bio && <p className="educator-bio">{edu.bio}</p>}

              <div className="educator-contact">
                {edu.email && (
                  <p>📧 <a href={`mailto:${edu.email}`} target="_blank" rel="noopener noreferrer">{edu.email}</a></p>
                )}
                {edu.phone && (
                  <p>📞 <a href={`tel:${edu.phone}`} target="_blank" rel="noopener noreferrer">{edu.phone}</a></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Educators;
