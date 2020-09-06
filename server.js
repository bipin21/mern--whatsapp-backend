// imports
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// const Pusher = require('pusher');

// app config
const app = express();
const port = process.env.PORT || 9000;

// pusher

var pusher = new Pusher({
    appId: '1067665',
    key: 'b4bce440702782b3d04c',
    secret: '8e0930a28888501b8c08',
    cluster: 'eu',
    encrypted: true
});

// middleware
app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*"),
//         res.setHeader("Access-Control-Allow-Header", "*"),
//         next();
// });

// DB Config
const connection_url = "mongodb+srv://admin:QEvqVOtGdS7nHu64@cluster0.qz6at.mongodb.net/whatsappmern?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection

db.once('open', () => {
    console.log("DB connected");
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        // console.log(change)
        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.user,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                recieved: messageDetails.recieved,
                roomId: messageDetails.roomId,
            });
        }
        else {
            console.log('Error Triggering pusher.')
        }
    })
})

// api routes
app.get("/", (req, res) => res.status(200).send('hello world'));

app.get(`/messages/sync`, (req, res) => {
    var query = req.query;

    // convert year parameter string to int if it exists 
    if (query.hasOwnProperty("roomId")){
        query["roomId"] = query.roomId;
    }
    Messages.find(query,(err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.status(200).send(data)
        }
    })
})


app.post("/messages/new", (req, res) => {
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

// listen
app.listen(port, () => console.log(`listening on localhost: ${port}`));
