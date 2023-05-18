const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try {
        //Data Fetch
        const { sectionName, courseId } = req.body;

        //Data Validation 
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Preoperties",
            })
        }

        //Create Section
        const newSection = await Section.create({ sectionName });

        //Update course by section ID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        )
        //TODO:HM use populate the to replace section/sub-sections
        //Return Response

        return res.status(200).json({
            success: true,
            message: "Section successfully created",
            updatedCourseDetails,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        //Data fetch
        const { sectionName, sectionId } = req.body;

        //Validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing Preoperties",
            })
        }

        //Update data
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        //Return 
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message
        })
    }
}

//Delete section

exports.deleteSection = async (req, res) => {
    try {
        //getId
        const { sectionId } = req.params

        //use findbyidanddelete
        await Section.findByIdAndDelete({ sectionId });

        //Return Response
        return res.status(200).json({

            success: true,
            message: "Section deleted successfully"
        })

    }

    } catch (error) {
    res.status(500).json({
        success: false,
        message: "Unable to create section, please try again",
        error: error.message
    })
}
}