const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\./;
    return emailRegex.test(email);
};

module.exports = validateEmail;