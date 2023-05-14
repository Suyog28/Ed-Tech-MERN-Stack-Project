const User = require("../models/User");
const mailSender = require("../utils/mailSender");

//Reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        //get mail from req body

        const email = req.body.email;

        //Check user for an email, validation
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Your email is not registered with us"
            })
        }

        //Generate token 
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate({
            email: email
        }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 100
        }, {
            new: true
        })

        //URL crated 
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containing URL 
        await mailSender(email,
            "Password Reset link",
            `Password Reset Link:${url}`);

        //Response 
        return res.json({
            success: true,
            message: "Email send Successfully, please check email and change password"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending reset password mail"
        })
    }
}

//Reset Password

exports.resetPassword = async (req, res) => {
    try {
        //Data Fetch
        const { paasword, confirmPassword, token } = req.body;

        //validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password is not matching"
            })
        }

        //get userDetails from db using token
        const userDetails = await user.findOne({ token: token });

        //if no entry- invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid"
            })
        }

        //token time
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired, please regenerate your token"
            })
        }

        //Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        //update the password
        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        )

        //return response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating password"
        })
    }
}