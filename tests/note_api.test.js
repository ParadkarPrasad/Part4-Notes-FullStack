const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const Note = require('../models/note')
const User = require('../models/user');
describe('when there is initially some notes saved', ()=>{
  beforeEach(async()=>{
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
  })

  test('all notes are returned', async ()=>{
    const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })
})


describe('addition of a new note',()=>{

  test('a valid note can be added ', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(r => r.content)
  
    assert.strictEqual(response.body.length, helper.initialNotes.length + 1)
  
    assert(contents.includes('async/await simplifies making async calls'))
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)
  
      const notesAtEnd = await helper.notesInDb()
      console.log(notesAtEnd)
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
  })
})

describe('viewing a specific note', () => {

  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
  
    const noteToView = notesAtStart[0]
  
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    assert.deepStrictEqual(resultNote.body, noteToView)
    //assert.strictEqual(JSON.stringify(resultNote.body.toString()), JSON.stringify(noteToView.toString()))
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a note', ()=>{

  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]
  
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
  
    const notesAtEnd = await helper.notesInDb()
  
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  
    const contents = notesAtEnd.map(r => r.content)
    assert(!contents.includes(noteToDelete.content))
  })
})

describe('when there is initially one user in db', ()=>{
  beforeEach(async()=>{
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret',10)
    const user = new User({username: 'root',passwordHash: passwordHash})

    await user.save()
  })

  test('creation succeeds with a fresh username', async()=>{
    const userAtStart = await helper.usersInDb()

    const newUser ={
      username:'mlukkao',
      name: 'Archie',
      password: 'salainen'
    }

    await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.usersInDb()
    assert.strictEqual(userAtEnd.length , userAtStart.length + 1)

    const usernames = userAtEnd.map(u=> u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper status code and message if username is already taken', async()=>{
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username:'root',
      name:'Superuser',
      password:'salainen',
    }

    const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))
    assert.strictEqual(usersAtEnd, usersAtStart.length)
  })
})
after(async () => {
  await mongoose.connection.close()
})