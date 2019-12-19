// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for gifts
const Gift = require('../models/gift')


// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { gift: { title: '', text: 'foo' } } -> { gift: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`


/***************************************************************************/ 
/***************************************************************************/ 
// const requireToken = passport.authenticate('bearer', { session: false })
/***************************************************************************/
/***************************************************************************/ 


// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /gifts
router.get('/gifts', (req, res, next) => {
  
  // Option 1 get user's gifts
  
  Gift.find()
  // Gift.find({owner: req.user.id})
    .then(gifts => res.status(200).json({gifts: gifts}))
    .catch(next)
  
  // // Option 2 get user's gifts
  // // must import User model and User model must have virtual for gifts
  // User.findById(req.user.id) 
    // .populate('gifts')
    // .then(user => res.status(200).json({ gifts: user.gifts }))
    // .catch(next)
})

// SHOW
// GET /gifts/5a7db6c74d55bc51bdf39793
router.get('/gifts/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Gift.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "gift" JSON
    .then(gift => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, gift)
    
      res.status(200).json({ gift: gift.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /gifts
router.post('/gifts', (req, res, next) => {
  // set owner of new gift to be current user
  // req.body.gift.owner = req.user.id
console.log("hello yo walaijsflkasdjf",req.body.gift)
  Gift.create(req.body.gift)
    // respond to succesful `create` with status 201 and JSON of new "gift"
    .then(gift => {
      console.log(gift)
      res.status(201).json({ gift: gift.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /gifts/5a7db6c74d55bc51bdf39793
router.patch('/gifts/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.gift.owner

  Gift.findById(req.params.id)
    .then(handle404)
    .then(gift => {
      console.log("ana honaaaaaa",gift)
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, gift)

      // pass the result of Mongoose's `.update` to the next `.then`
      return gift.update(req.body.gift)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.status(204).json())
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /gifts/5a7db6c74d55bc51bdf39793
router.delete('/gifts/:id', (req, res, next) => {
  Gift.findById(req.params.id)
    .then(handle404)
    .then(gift => {
      // throw an error if current user doesn't own `gift`
      // requireOwnership(req, gift)
      // delete the gift ONLY IF the above didn't throw
      gift.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
});


module.exports = router
