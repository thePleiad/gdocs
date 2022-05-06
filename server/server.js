const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        method: ['GET', 'POST']
    }
})
const mongoose = require('mongoose');
const Document = require( './Document' );

const url = 'mongodb+srv://thepleiad:Mypassword1@cluster0.rp08z.mongodb.net/gdocs?retryWrites=true&w=majority';
const defaultValue = ''
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

io.on('connection', socket => {
    socket.on('get-document', async documentId => {
        const document = await findOrCreate(documentId)
        socket.join(documentId)
        socket.emit('load-document', document.data)
    
        socket.on('send-changes', delta => {
        socket.broadcast.to(documentId).emit('receive-changes', delta)
        })

        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })
})

async function findOrCreate(id) {
    if(id == null ) return
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id: id, data: defaultValue})
}