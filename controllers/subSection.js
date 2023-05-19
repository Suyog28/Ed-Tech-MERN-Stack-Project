const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const subSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
    try {
        //Fetch data from body
        const { sectionId, title, timeDuration, description } = req.body;
        //Extract file/Vidoe
        const video = req.files.videoFile;
        //Validation 
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // upload video to cloudinary
        const uploadVideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //Create a Sub-Section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadVideo.secure_url
        })

        //Update section with this sub section ObjectId

        const updateSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: subSectionDetails._id
                }
            }, { new: true });
        //TODO:HW log updated section here, after adding popolate query

        //return response
        return res.status(200).json({
            success: true,
            message: "Sub Section Created Successfully",
            updatedSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Sub Section unable to create, please try again",
            error: error.message
        })
    }
}

//TODO:HW Updated Section

