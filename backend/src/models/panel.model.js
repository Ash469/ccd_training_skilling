const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true 
    }, 
    endTime: { 
        type: String, 
        required: true 
    },
    capacity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    registeredStudents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
});

const panelSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    slots: [slotSchema]
});

module.exports = mongoose.model('Panel', panelSchema);