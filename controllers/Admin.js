const User = require('../models/user')
const Movie = require('../models/movie')
const Comment = require('../models/comment')
const Mail = require('../models/mail')

const jwt = require("jsonwebtoken");

const { body, validationResult, check } = require('express-validator')