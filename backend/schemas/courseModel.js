const mongoose = require("mongoose");

const courseModel = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    C_educator: {
      type: String,
      required: [true, "Educator name is required"],
      trim: true,
    },
    C_title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    C_categories: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    C_price: {
      type: String,
      default: "free",
    },
    C_description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    sections: [
      {
        S_title: {
          type: String,
          trim: true,
        },
        S_description: {
          type: String,
          trim: true,
        },
        S_content: [
          {
            filename: {
              type: String,
              trim: true,
            },
            path: {
              type: String,
              trim: true,
            },
          }
        ]
      }
    ],
    enrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['published', 'pending', 'draft'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = mongoose.model("course", courseModel);

module.exports = courseSchema;
