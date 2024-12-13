import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'https://project-1-m2bn.onrender.com';


function JoinGroup() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    axios.get('/api/groups')
      .then(response => setGroups(response.data))
      .catch(error => console.error('Error fetching groups:', error));
  }, []);

  const handleJoinGroup = (groupId) => {
    alert(`Joined group with ID: ${groupId}`);
    // Further logic for joining the group can be added here.
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Join a Study Group</h1>
      <div>
        {groups.map(group => (
          <div key={group._id} style={styles.groupCard}>
            <h3>{group.department} {group.course_number}: {group.name}</h3>
            <p>{group.description}</p>
            <button onClick={() => handleJoinGroup(group._id)} style={styles.button}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  header: { color: '#007BFF', marginBottom: '20px' },
  groupCard: { backgroundColor: '#f9f9f9', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' },
  button: { marginTop: '10px', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default JoinGroup;
