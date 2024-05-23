import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Chat.css';

const ENDPOINT = "http://localhost:4000";

function Chat({ user, setUser }) {
  const [socket, setSocket] = useState(null); // State to store the socket instance

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [status, setStatus] = useState('AVAILABLE');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, {
      auth: { token: user.token }
    });
    console.log(user.token)
    
    socket.on('receiveMessages', (message) => {
      if(message.receiverId === user.email){
      setMessages((prevMessages) => [...prevMessages, {sender: message.senderId, text: message.content}]);
      }
    });
    // setSocket(socket);

    if (receiverId !== '') {
      // Fetch messages only if receiverId is set
      setMessages([]);
      axios.get(`http://localhost:4000/api/chat/messages/${user.email}/${receiverId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then((response) => {
        console.log(response.data)  
        // If messages are undefined, set it to an empty array
        if (response.data === undefined) {
          setMessages([]);
        }
        else {
          // Loop through each message and populate the messages list
          response.data.forEach((message) => {
            if (message.sender === user.email) {
              // if(message.LLMinteraction !== undefined && message.LLMinteraction === true){
              //   setMessages((prevMessages) => [
              //     ...prevMessages,
              //     { sender: 'LLM (You)', text: message.content }
              //   ]);
              // } else {
              if(message.LLMsender === undefined || message.LLMsender === false){
              setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'You', text: message.content }
              ]);
            }
            } else {
              console.log("Message received: ", message)
              if(message.LLMsender !== undefined && message.LLMsender === true){
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { sender: 'LLM', text: message.content }
                ]);
              } else if(message.LLMreceiver === undefined || message.LLMreceiver === false){
              setMessages((prevMessages) => [
                ...prevMessages,
                { sender: message.sender, text: message.content }
              ]);
            }
            }
          });
          // setMessages(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
      });
    }

    axios.get('http://localhost:4000/api/auth/user_list')
      .then((response) => {
        // Remove the current user's ID from the list
        const filteredUserIds = response.data["userEmails"].filter((userId) => userId !== user.email);
        setUserIds(filteredUserIds);
        console.log('User IDs:', response.data["userEmails"]);
      })
      .catch((error) => {
        console.error('Error fetching user IDs:', error);
      });

    return () => {
      socket.disconnect();
    };
  }, [user.token, user.email, receiverId]);

  const handleSend = async () => {
    if (receiverId !== '' && message.trim() !== '') {
      const receiver_status = await axios.get(`http://localhost:4000/api/auth/status/${receiverId}`);

      if(receiver_status.data.status === 'BUSY'){
        const payload = {
          senderId: user.email,
          receiverId,
          content: message,
          LLMsender: false,
          LLMreceiver: true
        };

        await axios.post('http://localhost:4000/api/chat/send', payload, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }).then((response) => {
        console.log('Message sent:', response.data);
        const newMessage = {sender: 'You', text: response.data.content}
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage
        ]);
        console.log(messages);
      }).catch((error) => {
        console.error('Error sending message:', error);
      });

      const prompt = {
        message: message
      }
      const date = new Date();
        // get the current time
        const time = date.getTime();
        console.log(time);
      await axios.post('http://localhost:4000/api/chat/query-llm', prompt, {

        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }).then(async (response) => {
        console.log('Message received:', response.data);
        // save the current time in a variable
        //have a timer running and if it exceeds 10 seconds, send a message to the user
        
        // if time exceeds 10 seconds, send a message to the user
        const newMessage = {sender: 'LLM', text: response.data.content}
        // get the current time again
        const newTime = new Date().getTime();
        console.log(newTime);
        // get the difference between the two times
        const difference = newTime - time;
        console.log(difference);
        // if the difference is less than 10 seconds, send the message
        if(difference < 4000){
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage
        ]);
        console.log(messages);

        const payload = {
          senderId: receiverId,
          receiverId: user.email,
          content: response.data.content,
          LLMsender: true,
          LLMreceiver: false
        };
      }
      else {
        // if the difference is greater than 10 seconds, send a message to the user
        const newMessage = {sender: 'LLM', text: 'User busy. Please try again later.'}
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage
        ]);
      }

        await axios.post('http://localhost:4000/api/chat/send', payload, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
        })        

      }).catch((error) => {
        console.error('Error sending message:', error);
      });
    }
      else {
      const socket = socketIOClient(ENDPOINT);
      
      const payload = {
        senderId: user.email,
        receiverId,
        content: message,
        LLMsender: false,
        LLMreceiver: false
      };
      
      socket.emit('sendMessage', payload);
      // socket.emit('sendMessage', payload);
      // Send a POST request to the server to save the message
      await axios.post('http://localhost:4000/api/chat/send', payload, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }).then((response) => {
        console.log('Message sent:', response.data);
        const newMessage = {sender: 'You', text: response.data.content}
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage
        ]);
        console.log(messages);
      }).catch((error) => {
        console.error('Error sending message:', error);
      });
      }
      setMessage('');
    } else {
      // Handle case where receiverId is not set or message is empty
      console.log('Receiver ID not set or message is empty');
    }
  };

  const handleStatusChange = async () => {
    const newStatus = status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    try {
      await axios.post(`http://localhost:4000/api/auth/status`, { email: user.email, status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        console.log(user.email);
        // Assuming user object contains email and token properties
        await axios.post('http://localhost:4000/api/auth/logout', { email: user.email }, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
      }
      setUser(null);
    } catch (error) {
      console.error('Error logging out', error);
    }
  };
  
  return (
    <div className="chat-app">
      <Sidebar userIDs={userIds} setReceiverId={setReceiverId} />
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat Room</h2>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="status-button" onClick={handleStatusChange}>
              {status === 'AVAILABLE' ? 'Set Busy' : 'Set Available'}
            </button>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="chat-history">
          {messages.map((message, index) => (
            <div key={index} className="chat-message">
              <strong>{message.sender}:</strong> {message.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};


export default Chat;

