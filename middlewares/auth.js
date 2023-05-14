const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("../models/User");

//Auth

exports.auth = async (req, res, next) => {
    try {
        //extract Token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer", "");

        //if token missing return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token not found"
            })
        }

        //Verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (err) {
            //Verification issue
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token"
        })
    }
}


//isStudent 

exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "this is a protected route for student only"
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}

//isInstrcutor 

exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Instructor only"
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}


//isAdmin

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Admin only"
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}