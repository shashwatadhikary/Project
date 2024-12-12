import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
axios.defaults.baseURL = 'http://localhost:5001';


function CreateGroup() {
  const [newGroup, setNewGroup] = useState({
    name: '',
    department: '',
    course_number: '',
    description: '',
  });

  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup({ ...newGroup, [name]: value });
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    axios.post('/api/groups', newGroup)
      .then(response => {
        alert('Group created successfully!');
        setNewGroup({ name: '', department: '', course_number: '', description: '' });
        navigate('/app'); // Redirect to the main page (home) after successful creation
      })
      .catch(error => console.error('Error creating group:', error));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Create a New Study Group</h1>
      <form onSubmit={handleCreateGroup} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Group Name"
          value={newGroup.name}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="department"
          placeholder="Course Department"
          value={newGroup.department}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="course_number"
          placeholder="Course Number"
          value={newGroup.course_number}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newGroup.description}
          onChange={handleInputChange}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>Create Group</button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  header: { color: '#007BFF', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
  textarea: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
  button: { padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default CreateGroup;
