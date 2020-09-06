import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    recieved: Boolean,
    roomId:String
})

export default mongoose.model('messagecontent', whatsappSchema);