const Tokens = require('csrf');
const tokens = new Tokens();

let secret = tokens.secretSync();

let generateCSRFToken = () => {
    return new Promise((resolve, reject) => {
   
        try {
            secret = tokens.secretSync();
            const csrfToken = tokens.create(secret);
            resolve(csrfToken);
        }
        catch (error) {
            reject(error);
        }

    });
}


let verifyCSRFToken = (token) => {
    return new Promise((resolve, reject) => {
        try {
            const isValid = tokens.verify(secret, token);
            if (!isValid) {
                reject(new Error('Invalid CSRF token'));
            }
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateCSRFToken,
    verifyCSRFToken
}