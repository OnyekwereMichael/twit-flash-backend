import jwt from 'jsonwebtoken';

export const generateTokenandSetCookie = (userId, res) => {
    // Generate a JWT token with the user's ID
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    // Set the token as a secure, HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV !== 'development', // Ensures cookies are sent over HTTPS in production
        sameSite: 'strict', // Restricts cross-site cookie sharing
        maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie expires in 15 days
    });
};
