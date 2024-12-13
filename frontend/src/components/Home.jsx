import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'https://project-1-m2bn.onrender.com';

function Home() {
  const [meetings, setMeetings] = useState([]); // List of meetings
  const [newMeeting, setNewMeeting] = useState({
    location: '',
    date: '',
    time: '',
    description: '',
  }); // Form data for new meeting

  // Fetch meetings from the backend
  useEffect(() => {
    axios.get('/api/meetings')
      .then((response) => setMeetings(response.data))
      .catch((error) => console.error('Error fetching meetings:', error));
  }, []);

  // Handle input changes for the new meeting form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting({ ...newMeeting, [name]: value });
  };

  // Create a new meeting
  const handleAddMeeting = (e) => {
    e.preventDefault();
    axios.post('/api/meetings', newMeeting)
      .then((response) => {
        setMeetings([{ ...newMeeting, _id: response.data._id }, ...meetings]); // Add the meeting locally
        setNewMeeting({ location: '', date: '', time: '', description: '' }); // Clear form
      })
      .catch((error) => console.error('Error creating meeting:', error));
  };

  // Delete an existing meeting
  const handleDeleteMeeting = (meetingId) => {
    axios.delete(`/api/meetings/${meetingId}`)
      .then(() => {
        setMeetings(meetings.filter((meeting) => meeting._id !== meetingId)); // Remove meeting locally
      })
      .catch((error) => console.error('Error deleting meeting:', error));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Home</h1>

      {/* Upcoming Meetings Section */}
      <h2 style={styles.subHeader}>Upcoming Meetings</h2>
      <div style={styles.meetingsContainer}>
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div key={meeting._id} style={styles.meetingCard}>
              <h3 style={styles.meetingTitle}>{meeting.location}</h3>
              <p><strong>Date:</strong> {meeting.date}</p>
              <p><strong>Time:</strong> {meeting.time}</p>
              <p><strong>Description:</strong> {meeting.description}</p>
              <button
                onClick={() => handleDeleteMeeting(meeting._id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p style={styles.noMeetings}>No upcoming meetings.</p>
        )}
      </div>

      {/* Create a New Meeting Section */}
      <h2 style={styles.subHeader}>Create a New Meeting</h2>
      <form onSubmit={handleAddMeeting} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="location" style={styles.label}>Location:</label>
          <input
            type="text"
            name="location"
            value={newMeeting.location}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="date" style={styles.label}>Date:</label>
          <input
            type="date"
            name="date"
            value={newMeeting.date}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="time" style={styles.label}>Time:</label>
          <input
            type="time"
            name="time"
            value={newMeeting.time}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Description:</label>
          <textarea
            name="description"
            value={newMeeting.description}
            onChange={handleInputChange}
            required
            style={styles.textarea}
          />
        </div>
        <button type="submit" style={styles.button}>Add Meeting</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#007BFF',
    marginBottom: '20px',
  },
  subHeader: {
    color: '#333',
    marginBottom: '10px',
    borderBottom: '2px solid #007BFF',
    paddingBottom: '5px',
  },
  meetingsContainer: {
    marginBottom: '30px',
  },
  meetingCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  meetingTitle: {
    marginBottom: '10px',
    color: '#007BFF',
  },
  noMeetings: {
    textAlign: 'center',
    color: '#999',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  textarea: {
    width: '100%',
    height: '80px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default Home;
