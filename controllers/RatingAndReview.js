const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { request } = require("express");

exports.createRating = async (req, res) => {
    try {
        //get User Id
        const userId = request.user.id;
        //fetch data from request body
        const { rating, review, courseId } = request.body;

        //check if user already enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } },
        });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course",
            });
        }

        //Check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user."
            })
        }


        //Create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review, course: courseId, user: userId,
        })

        //update the course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            }, { new: true });
        console.log(updatedCourseDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",

        })
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}

//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        //get courseId
        const courseId = req.body.courseId;
        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },

                }
            }
        ])



        //return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })

        }
        //if no rating/review
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no rating given till now",
            averageRating: 0
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}


//getAllRating

exports.getAllRating = async (req, res) => {
    try {
        //get all rating

        const allReview = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image ",
            }).populate({
                path: "course",
                select: "courseName",
            }).exec();
        return res.status(200).json({
            success: true,
            message: "All review fetched successfully",
            data: allReview,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}