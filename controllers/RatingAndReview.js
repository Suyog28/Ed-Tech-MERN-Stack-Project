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


//getAllRating