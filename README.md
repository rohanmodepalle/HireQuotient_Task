# HireQuotient_Task

Install MongoDB and Node.js and add them to the system PATH.

To run the code, in the root folder, run the following commands:
```npm init -y```
```npm install express mongoose bcryptjs jsonwebtoken socket.io axios dotenv```

Then in the backend folder, run the following command:
```npmx nodemon server.js```

Then in the frontend folder, run the following command:
```npm start```

The app will be running on http://localhost:3000/

The API route descriptions are as follows:
1. GET /api/chat/messages/:senderId/:receiverId
Description: Fetches chat messages between the sender and receiver.
URL Parameters:
senderId: ID of the message sender.
receiverId: ID of the message receiver.
Response:
[
  {
    "sender": "user@example.com",
    "receiver": "otheruser@example.com",
    "content": "Hello, how are you?"
  },
  {
    "sender": "otheruser@example.com",
    "receiver": "user@example.com",
    "content": "I'm good, thank you!"
  }
]

2. POST /api/chat/send
Description: Sends a message from the sender to the receiver.
Request Body:
{
  "senderId": "user@example.com",
  "receiverId": "otheruser@example.com",
  "content": "Hello, how are you?"
}
Response:
{
  "sender": "user@example.com",
  "receiver": "otheruser@example.com",
  "content": "Hello, how are you?"
}

3. POST /api/chat/query-llm
Description: Queries the Language Learning Model (LLM) for a response.
Request Body:
{
  "prompt": "Can you help me with this problem?"
}
Response:
{
  "content": "Sure, I can assist you with that."
}

4. GET /api/auth/user_list
Description: Fetches a list of all users registered in the system.
Response:
{
  "userEmails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}

5. POST /api/auth/status
Description: Updates the status (AVAILABLE or BUSY) of a user.
Request Body:
{
  "email": "user@example.com",
  "status": "AVAILABLE"
}
Response:
{
  "message": "User status updated successfully"
}


The API routes can be tested using Postman or any other API testing tool.
The environment variables for the MongoDB connection string, JWT secret key and LLM API should be set in a .env file in the backend folder.


The video can be found in the following drive link:
https://drive.google.com/drive/folders/1XGhphIIPPW_pf1jHF7JTag1FUk1U1kRt?usp=sharing
