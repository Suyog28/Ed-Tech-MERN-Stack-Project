const User = require("../models/User");
const Tag = require("../models/Tags");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Create Course Handgle function

exports.createCourse = async (req, res) => {
    try {

        //fetch the data from body
        const { courseName, courseDescription, whatYouWillLearn, tag, price } = req.body;


        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //check instructor 
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details:", instructorDetails);
        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "Instructor Details not found"
            })
        }

        //check Tag is valid or not
        const tagDetails = await Tag.findById(tag);

        if (!tagDetails) {
            return res.status(400).json({
                success: false,
                message: "tag not found"
            })
        }

        //Upload Image to clodinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //Create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        //Add new course to the user schema of instructor

        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true }
        )

        //Update Tag Schema 
        //TODO: HM
        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Course ",
        })

    }
}


//Get all Courses handler functions
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReview: true,
            studentsEnrolled: true
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "Data for all course fetched successfully",
            data: allCourses,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Can not fetch course data",
            error: error.message
        })
    }
}




