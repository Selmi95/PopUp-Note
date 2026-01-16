const validator = require('validator');

/**
 * Validates user registration input
 */
function validateRegisterInput(data) {
    const errors = {};

    data.email = data.email || '';
    data.password = data.password || '';

    if (!validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (!validator.isLength(data.password, { min: 8, max: 30 })) {
        errors.password = 'Password must be between 8 and 30 characters';
    }

    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
}

/**
 * Validates note input
 */
function validateNoteInput(data) {
    const errors = {};

    data.title = data.title || '';
    data.content = data.content || '';

    if (validator.isEmpty(data.title)) {
        errors.title = 'Title is required';
    }

    if (!validator.isLength(data.title, { max: 100 })) {
        errors.title = 'Title must not exceed 100 characters';
    }

    if (validator.isEmpty(data.content)) {
        errors.content = 'Content is required';
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
}

module.exports = {
    validateRegisterInput,
    validateNoteInput
};
