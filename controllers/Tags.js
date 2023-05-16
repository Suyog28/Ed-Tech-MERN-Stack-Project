const Tag = require("../models/Tags");

//Create Tag

exports.createTag = async (req, res) => {
    try {
        //Fetch data
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All field are required"
            })
        }

        //Create DB entries
        const tagDetails = await Tag.create({
            name: name,
            description: description
        })
        console.log(tagDetails);
        return res.status(200).json({
            success: true,
            message: "Tag has been successfully created"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Tag not created"
        })
    }
}

//getAlltag handler function

exports.getAlltags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: "All tags return successfully",
            allTags
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}