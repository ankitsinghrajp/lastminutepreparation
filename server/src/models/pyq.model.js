import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema({
  standard: {
    type: String,
    enum: ["9","10","11","12"],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    min: 2014,
    max: 2026,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["MCQ","FillInTheBlank","TrueFalse","VeryShortAnswer","ShortAnswer","LongAnswer"],
    default: "ShortAnswer"
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        if(this.type === "MCQ") return v.length === 4; // MCQs must have 4 options
        if(this.type === "TrueFalse") return v.length <= 2; // Optional
        return true; // Other types don't need options
      },
      message: props => `Invalid options length for question type: ${props.path}`
    },
    default: []
  },
  answer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    default: null
  },
  priority: {
    type: String,
    enum: ["high","medium","low"],
    default: "medium"
  }
}, { timestamps: true });

const PYQ = mongoose.models.PYQ || mongoose.model("PYQ", pyqSchema);
export { PYQ };
