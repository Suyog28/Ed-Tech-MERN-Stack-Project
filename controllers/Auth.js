const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//Send OTP
exports.sendOTP = async (req, res) => {
    try {
        //Fetch email from request body
        const { email } = req.body;

        //Check if user already exists
        const checkUserPresent = await User.findOne({ email });

        //If user already exist, then return response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already registered"
            })
        }

        //generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        console.log("Generated OTP", otp)

        //check unique otp or not
        let result = await OTP.findOne({ otp: otp })
        while (result) {
            let otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ otp: otp })
        }

        const otpPayLoad = { email, otp };

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);

        //Return response successfull
        res.status(200).json({
            success: true,
            message: "OTP sent Successfully",
            otp,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//signup

exports.signUp = async (req, res) => {
    try {

        //fetch user details
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        //validate
        if (!firstName || !lastName || !password || !confirmPassword || !email || !otp) {
            return res.status(403).json({
                success: false,
                message: "All field are required"
            })
        }

        //Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password and confirm password doesnot match"
            })
        }


        //check user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered"
            })
        }

        //find most recent otp in database for the user
        const mostRecentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("Recent OTP", mostRecentOtp);

        //Validate OTP
        if (mostRecentOtp.length === 0) {
            //OTP found
            return res.status(200).json({
                success: true,
                message: "OTP Found"
            })
        } else if (otp !== mostRecentOtp.otp) {
            //Invalid OTP
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }


        //Hash password
        const userHashPassword = await bcrypt.hash(password, 10);

        //Entry create in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: userHashPassword,
            accountType,
            additonalDetails: profileDetails._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`
        })

        //return res
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User not registered, please try again"
        })
    }
}


//login

exports.login = async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;

        //validate the data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        //user check exists or not

        const user = await User.findOne({ email }).populate("additionalDetails");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please sign up"
            })
        }

        //generate  JWT token after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1h"
            })
            user.token = token;
            user.password = undefined;
            //Create cookies
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in succesfully"
            })
        } else {
            res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Login failure, Please try again"
        })
    }
}