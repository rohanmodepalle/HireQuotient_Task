import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ userIDs, setReceiverId }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await Promise.all(
          userIDs.map(async (userID) => {
            const response = await axios.get(`http://localhost:4000/api/auth/status/${userID}`);
            return { userID, status: response.data.status };
          })
        );
        const statusMap = {};
        statuses.forEach(({ userID, status }) => {
          statusMap[userID] = status;
        });
        setUserStatuses(statusMap);
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };

    fetchStatuses();
  }, [userIDs]);

  const handleUserClick = (receiverId, index) => {
    setReceiverId(receiverId);
    setActiveButton(index);
  };

  return (
    <div className="sidebar">
      <h2>Users</h2>
      <ul>
        {userIDs.map((userID, index) => (
          <li
            key={index}
            className={activeButton === index ? 'active' : ''}
            onClick={() => handleUserClick(userID, index)}
          >
            {console.log(userID.email)}
            {userID} - {userStatuses[userID] || 'Loading...'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
