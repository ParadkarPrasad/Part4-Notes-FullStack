const Note = require('../models/note')
const User = require('../models/user')
const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content:'Browser can execute only Javascript',
    important: true
  }
]

const nonExistingId = async()=>{
  const note = new Note({content: 'willremovethissoon'})
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const usersInDb = async ()=>{
  const user = await User.find({})
  return user.map(u=> u.toJSON())
}
const notesInDb = async()=>{
  const notes = await Note.find({})
  return notes.map(note=>note.toJSON())
}

module.exports ={
  initialNotes,nonExistingId,notesInDb, usersInDb
}