import Requests from '../models/requests.model.js';
import Users from '../models/userModel.model.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer'
import validator from 'validator'
import TwoFA from '../models/twoFA.model.js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// import User from '../models/userModel.model.js'

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken"); // ← FIXED import
// const crypto = require('crypto')
// const nodemailer = require('nodemailer')
// const path = require('path')
// const validator = require('validator')
// const ejs = require('ejs')

// const generateToken = (res, payload) => {
//     const token = jwt.sign(payload, process.env.SECRET, {
//         expiresIn: process.env.EXPIRES || '1d',
//     });
//     res.cookie(`token_${payload.id}`, token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'strict',
//         maxAge: 24 * 60 * 60 * 1000
//     })
//     return token;
// };

const generateToken = (res, payload) => {
    const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: process.env.EXPIRES || '1d'
    })

    res.cookie(`token_${payload.id}`, token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    })

    return token
}

// import Users from '../models/Users.js';
// import TwoFA from '../models/TwoFA.js';

export const register = async (req, res) => {
    const { username, password, email, orgid, type } = req.body;

    if (!username || !password || !email || !type || !orgid) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    try {
        const newUser = new Users({
            userName: username,
            password,
            email,
            orgid,
            uType: type
        });

        await newUser.save();

        // Create TwoFA document
        const add2FA = new TwoFA({
            userid: newUser._id,
            twofaStatus: true,
            emailStatus: true,
            emailToken: ""
        });

        await add2FA.save();

        return res.status(200).json({
            message: "User created successfully",
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const login = async (req, res) => {
    try {
        const { orgid, email, password } = req.body

        if (!orgid || !email || !password) {
            return res.status(200).json({
                message: "missing required field"
            })
        }

        const isExistingUser = await Users.findOne({
            orgid: orgid,
            email: email,
            // password: password

        })

        // console.log(isExistingUser,"isExistingUser")

        if (!isExistingUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }


        const ispasswordValid = await bcrypt.compare(password, isExistingUser.password)
        if (!ispasswordValid) {
            return res.status(404).json({ message: "Invalid password" })
        }

        const jwtToken = generateToken(res, { id: isExistingUser._id, email: isExistingUser.email }, isExistingUser.uType)


        return res.status(200).json({
            message: "Login Successfull",
            user: isExistingUser
        })

    } catch (error) {
        return res.status(400).json({ error: error.message });

    }
}


const generateuuid = () => {
    return crypto.randomBytes(2).toString('hex');
}

const tokenStore = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAndSenToken = async (req, res) => {
    try {
        const { wallid } = req.body;

        if (!wallid) {
            return res.status(400).json({ message: "userid is required" });
        }

        // Find user
        const existingUser = await Users.findById(wallid);
        console.log(existingUser, "existingUser");

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const uuid = generateuuid();
        console.log(uuid, "uuid");

        // Update or create TwoFA record
        const add2FA = await TwoFA.findOneAndUpdate(
            { userid: wallid },
            {
                $set: {
                    twofaStatus: true,
                    emailStatus: true,
                    emailToken: uuid
                }
            },
            { new: true, upsert: true } // upsert = create if not exists
        );

        // Expiry time in memory
        const fiveMinutesLater = Date.now() + 5 * 60 * 1000;
        tokenStore.set(existingUser.email, { uuid, fiveMinutesLater });

        // Render template
        const templatePath = path.join(__dirname, "..", "views", "TwoFa", "twofa.ejs");
        const htmlContent = await ejs.renderFile(templatePath, { uuid });
        const subject = 'Two Factor Authentication';

        // Send email
        try {
            await sendEmail(existingUser, subject, htmlContent);
        } catch (emailError) {
            return res.status(500).json({
                message: 'Failed to send email',
                error: emailError.message
            });
        }

        return res.status(200).json({
            message: 'Token generated and sent successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error generating or storing token',
            error: error.message
        });
    }
};


const collegueRequests = async (req, res) => {
    try {
        const { orgid, username, password, email } = req.body;
        if (!orgid || !username || !password || !email) {
            return res.status(400).json({ error: 'Please provide all the details' })
        }

        const addRequests = new Requests({
            orgid: orgid,
            userName: username,
            password: password,
            email: email

        })

        await addRequests.save()


        if (addRequests) {
            res.status(200).json({
                message: 'Request sent successfully',
            })
        }




    } catch (error) {
        res.status(400).json({ error })
    }
}


const deleteRequest = async (req, res) => {
    try {
        const { reqid } = req.body

        const existingRequest = await Requests.findById({
            reqid
        })

        if (!existingRequest) {
            return res.status(404).json({
                message: "No data found"
            })
        }

        await Requests.deleteOne({
            _id: reqid
        })

        res.status(200).json({
            message: 'Deleted',
        });

    } catch (error) {
        return res.status(500).json({ error })
    }
}

const validateToken = async (req, res) => {
    try {

        const { email, token } = req.body
        if (!email || !token) {
            return res.status(404).json({
                message: "Please provide the mandatory fields"
            })
        }
        console.log(tokenStore, "tokenStore")

        const { uuid, fiveMinutesLater } = tokenStore.get(email);
        if (fiveMinutesLater < Date.now()) {
            return res.status(404).json({ message: "Token Expired (5 Minutes)" })

        }
        console.log(uuid, "uuid")

        const user = await Users.findOne({
            email
        })
        console.log(user, "user")

        const twofAUser = await TwoFA.findOne({
            userid: user._id
        })

        console.log(uuid, "twofAUser")
        console.log(twofAUser.emailToken, "twofAUser")

        if (uuid === twofAUser.emailToken) {
            return res.status(200).json({ message: "Valid Token" })
        }

        return res.status(400).json({ message: "InValid Token" })


    } catch (error) {
        return res.status(500).json({
            message: 'Error validating token',
            error: error.message
        });
    }
}



// const login = async (req, res) => {
//     const { orgid, email, password } = req.body
//     try {
//         const pool = await poolPromise;
//         if (!validator.isEmail(email)) {
//             return res.status(400).json({ message: "Invalid email format" });
//         }
//         if (!orgid || !email || !password) {
//             return res.status(404).json({ message: "Please fill the required fields" })

//         }
//         const query = 'select * from users where email = $1 and orgid = $2';
//         const values = [email, orgid]
//         const result = await pool.query(query, values);
//         const user = result.rows
//         if (!user) {
//             return res.status(404).json({ message: "User Not Found" })
//         }
//         const isPasswordValid = await bcrypt.compare(password, user[0].password)
//         if (!isPasswordValid) {
//             return res.status(404).json({ message: "Invalid password" })
//         }

//         const jwtToken = generateToken(res, { id: user[0].wallid, email: user[0].email });

//         return res.status(200).json({ message: "Valid user", user: user[0] })


//     } catch (error) {
//         return res.status(400).json({ error: error.message });
//     }
// }

// const generateuuid = () => {
//     return crypto.randomBytes(2).toString('hex');
// }

// const tokenStore = new Map();
const generateAndSendToken = async (req, res) => {
    try {

        const { wallid } = req.body;

        if (!wallid) {
            return res.status(400).json({ message: 'wallid is required' });
        }
        const user = await Users.findById({ wallid }).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // if (!result) {
        //     return res.status(404).json({ message: 'User not found' });
        // }
        // const user = result.rows[0]

        const uuid = generateuuid()

        const query = 'select addtwoFA($1, $2)';
        const values = [wallid, uuid];

        await pool.query(query, values);

        const currentDate = new Date()
        const fiveMinutesLater = Date.now() + 1 * 60 * 1000;;

        tokenStore.set(user.email, { uuid, fiveMinutesLater })
        const transporter = nodemailer.createTransport({
            service: "Gmail", // Use any other SMTP service if needed
            auth: {
                user: "ranjithraja413@gmail.com", // Replace with your email
                pass: "nywx pfrh daai ytzv", // Use an app password if needed
            },
        });

        const templatepath = path.join(__dirname, "..", "views", "TwoFa", "twofa.ejs")
        const htmlContent = await ejs.renderFile(templatepath, { uuid })

        const mailOptions = {
            from: "ranjithraja413@gmail.com",
            to: user.email,
            subject: "Two-Factor Authentication",
            html: htmlContent,
        };

        // Send mail
        const info = await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: 'Token generated and stored successfully',
            token: uuid,
            info
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error generating or storing token',
            error: error.message
        });
    }
};

// const validateToken = async (req, res) => {
//     try {
//         const { email, token } = req.body
//         if (!email || !token) {
//             return res.status(404).json({
//                 message: "Please provide the mandatory fields"
//             })
//         }
//         const { uuid, fiveMinutesLater } = tokenStore.get(email);
//         if (fiveMinutesLater < Date.now()) {
//             return res.status(404).json({ message: "Token Expired (5 Minutes)" })
//         }
//         const pool = await poolPromise

//         const userResult = await pool.query('SELECT wallid FROM users WHERE email = $1',
//             [email])
//         if (!userResult) {
//             return res.status(200).json({
//                 message: "User not found"
//             })
//         }

//         const tokenResult = await pool.query('SELECT email_token FROM twofactauth WHERE wallid = $1',
//             [userResult.rows[0].wallid])

//         if (tokenResult.rows[0].email_token !== token) {
//             return res.status(400).json({
//                 message: "Invalid token"
//             })
//         }

//         return res.status(200).json({
//             flag: 'Y',
//             message: "Valid token"
//         })

//     } catch (error) {
//         return res.status(500).json({
//             message: 'Error generating or storing token',
//             error: error.message
//         });
//     }
// }

// const forgotStore = new Map();
// const sendForgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body
//         if (!email || !validator.isEmail(email)) {
//             return res.status(400).json({ message: "Invalid email format" });
//         }
//         const forgotToken = generateuuid()
//         const fiveMinutesLater = Date.now() + 5 * 60 * 1000
//         forgotStore.set(email, { forgotToken, fiveMinutesLater })

//         const transporter = nodemailer.createTransport({
//             service: "Gmail", // Use any other SMTP service if needed
//             auth: {
//                 user: "ranjithraja413@gmail.com", // Replace with your email
//                 pass: "nywx pfrh daai ytzv", // Use an app password if needed
//             },
//         });

//         const templatepath = path.join(__dirname, "..", "views", "TwoFa", "twofa.ejs")
//         const htmlContent = await ejs.renderFile(templatepath, { uuid: forgotToken })

//         const mailOptions = {
//             from: "ranjithraja413@gmail.com",
//             to: email,
//             subject: "Forgot Password - Code",
//             html: htmlContent,
//         };

//         // Send mail
//         const info = await transporter.sendMail(mailOptions);

//         return res.status(200).json({
//             message: 'Token generated',
//             token: forgotToken,
//             info
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Error generating or storing token',
//             error: error.message
//         });
//     }
// }

// const validateForgotToken = async (req, res) => {
//     try {
//         const { email, token } = req.body
//         const { forgotToken, fiveMinutesLater } = forgotStore.get(email);
//         if (fiveMinutesLater < Date.now()) {
//             return res.status(404).json({ message: "Token Expired (5 Minutes)" })
//         }
//         if (forgotToken !== token) {
//             return res.status(404).json({ message: "Invalid Token" })
//         }
//         return res.status(200).json({ message: "Valid Token" })
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Error generating or storing token',
//             error: error.message
//         });
//     }
// }

// const logout = async (req, res) => {
//     try {
//         const { userid } = req.body
//         res.clearCookie(`token_${userid}`, {
//             httpOnly: true,
//             sameSite: 'strict',
//             secure: false
//         })
//         res.status(200).json({ msg: 'Logged out successfully' });

//     } catch (error) {
//         return res.status(500).json({ error })
//     }
// }

// const updatePassword = async (req, res) => {
//     try {
//         const { email, password } = req.body
//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and Password are required" })
//         }
//         const pool = await poolPromise;
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const query = 'select updatePassword($1,$2)';
//         const values = [email, hashedPassword]
//         await pool.query(query, values)
//         res.status(200).json({
//             message: 'User registered successfully',
//             // token: jwtToken
//         });


//     } catch (error) {
//         return res.status(500).json({ error })
//     }
// }

// const deleteRequest = async (req, res) => {
//     try {
//         const { reqid } = req.body
//         const pool = await poolPromise
//         const query = 'delete from requests where reqid = $1'
//         const values = [reqid]
//         await pool.query(query, values)
//         res.status(200).json({
//             message: 'Deleted',
//         });

//     } catch (error) {
//         return res.status(500).json({ error })
//     }
// }



// module.exports = { updatePassword, register, login, generateAndSendToken, validateToken, sendForgotPassword, validateForgotToken, logout, deleteRequest };

export default {
    register,
    login,
    generateAndSenToken,
    collegueRequests,
    deleteRequest,
    validateToken
}