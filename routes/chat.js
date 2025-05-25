import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    const currentUser = req.user;
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    // Create message object with user info and timestamp
    const messageObject = {
        type: 'message',
        content: message,
        sender: currentUser.username,
        timestamp: new Date().toISOString()
    };

    // Broadcast message to all connected clients
    console.log('Broadcasting message through API:', messageObject);

    return res.status(200).json({
        message: 'Message sent successfully',
        user: currentUser,
        message: message
    });
});

export default router;

