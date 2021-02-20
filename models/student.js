const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true 
    },
    age: {
        type: Number,
        default: 18,
        max: [100, "wow you are so old!"]
    },
    schlarship: {
        merit: {
            type: Number,
            min: 0,
            max: [5000, "Too much merit schlarship"]
        },
        other: {
            type: Number,
            min: 0,
        },
    },
});

// create a model for students ; mongoose 規定 model 所用的參數必須為單數形式的詞, 首字要大寫 ex. Student
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;