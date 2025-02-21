// import jwt from 'jsonwebtoken';
// import { User } from '../models/user.js';

// const JWT_SECRET = process.env.JWT_SECRET;

// export const auth = async (req, res, next) => {
//     try{
//         const token = req.header('Authorization')?.replace('Bearer ', '');

//         if(!token){
//             throw new Error('No authentication token provided');
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         const user = await User.findOne({_id: decoded.userId, is_active: true });

//         if(!user){
//             throw new Error('User not found');
//         }

//         req.user = user;
//         req.token = token;
//         next();
//     } catch (error){
//         res.status(401).json({error: 'Authentication failed. Please log in again.', error});
//     }
// };

// //role-based authentication middleware
// // export const authorize = (...roles) => {
// //     return (req, res, next) => {
// //         if(!roles.includes(req.user.user_type)) {
// //             return res.status(403).json({
// //                 error: 'Unauthorized access. You do not have the required permissions'
// //             });
// //         }
// //         next();
// //     };
// // };


// export const authorize = (req, res, next) => {
//     if (!req.headers || !req.headers.authorization) {
//       return res.status(401).json({ message: "Authorization header is missing" });
//     }
  
//     const authHeader = req.headers.authorization;
//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Invalid token format" });
//     }
  
//     const token = authHeader.split(" ")[1];
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach user data
//       next();
//     } catch (err) {
//       return res.status(403).json({ message: "Invalid or expired token" });
//     }
// };



import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Authentication Middleware
export const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No authentication token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId, is_active: true });

        if (!user) {
            return res.status(401).json({ error: "User not found or inactive" });
        }

        req.user = user; // Attach user object
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Authentication failed. Please log in again." });
    }
};

// ✅ Role-Based Authorization Middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.user_type)) {
            return res.status(403).json({ error: "Unauthorized access. Insufficient permissions." });
        }
        next();
    };
};
