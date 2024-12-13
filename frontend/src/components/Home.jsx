import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5001';

function Home() {
  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    location: '',
    date: '',
    time: '',
    description: '',
  });

  useEffect(() => {
    axios.get('/api/meetings')
      .then(response => setMeetings(response.data))
      .catch(error => console.error('Error fetching meetings:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting({ ...newMeeting, [name]: value });
  };

  const handleAddMeeting = (e) => {
    e.preventDefault();
    axios.post('/api/meetings', newMeeting)
      .then(response => {
        setMeetings([{ ...newMeeting, _id: response.data._id }, ...meetings]);
        setNewMeeting({ location: '', date: '', time: '', description: '' });
      })
      .catch(error => console.error('Error creating meeting:', error));
  };

  const handleDeleteMeeting = (meetingId) => {
    axios.delete(`/api/meetings/${meetingId}`)
      .then(() => {
        setMeetings(meetings.filter(meeting => meeting._id !== meetingId));
      })
      .catch(error => console.error('Error deleting meeting:', error));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Home</h1>
      <h2 style={styles.subHeader}>Upcoming Meetings</h2>
      <div style={styles.meetingsContainer}>
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div key={meeting._id} style={styles.meetingCard}>
              <h3 style={styles.meetingTitle}>{meeting.location}</h3>
              <p><strong>Date:</strong> {meeting.date}</p>
              <p><strong>Time:</strong> {meeting.time}</p>
              <p><strong>Description:</strong> {meeting.description}</p>
              <button onClick={() => handleDeleteMeeting(meeting._id)} style={styles.deleteButton}>Delete</button>
            </div>
          ))
        ) : (
          <p style={styles.noMeetings}>No upcoming meetings.</p>
        )}
      </div>
      <h2 style={styles.subHeader}>Create a New Meeting</h2>
      <form onSubmit={handleAddMeeting} style={styles.form}>
        {/* Meeting form */}
      </form>
    </div>
  );
}

const styles = {
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
