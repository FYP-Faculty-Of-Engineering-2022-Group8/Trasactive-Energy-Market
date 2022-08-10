const {
    check
} = require('express-validator');
exports.validSign = [
    check('name', 'Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('name must be between 3 to 32 characters'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('password must contain a number')
]


exports.validLogin = [
    check('email', 'Email is required').notEmpty(),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters')
]


exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address').matches(/\d/)
];

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long').matches(/\d/).withMessage('password must contain a number')
];

exports.updatePasswordValidator=[
    check('name', 'Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('name must be between 3 to 32 characters'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('password must contain a number')
]


exports.profileChange=[
  check('status','Status is required').not() .isEmpty(),
  check('skills','Skills is required').not() .isEmpty()
]


exports.coverphotoChange=[
    check('avatar','No Profile Image  is selected').not() .isEmpty(),
  
  ]

exports.experienceadd=[
    check('title','Title is required').not() .isEmpty(),
    check('company','Company is required').not() .isEmpty(),
    check('from','From  date is required').not() .isEmpty()
  ]
  
  exports.educationadd=[
    check('school','School is required').not() .isEmpty(),
    check('degree','Degree is required').not() .isEmpty(),
    check('fieldofstudy','Field Of Study is required').not() .isEmpty(),
    check('from','From  date is required').not() .isEmpty()
  ]
