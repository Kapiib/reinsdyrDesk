const validateEmail = (email) => {
    // Simple email regex for basic validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\./;
    return emailRegex.test(email);
};

module.exports = validateEmail;