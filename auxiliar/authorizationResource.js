var rp = require('request-promise-native').defaults({json: true});

class AuthorizationResource {

    static async getUsername(token) {
        const url = 'https://fis-backend-login.herokuapp.com/api/v1/user'
        var options = {
            headers: {
                'User-Agent': 'Request-Promise',
                'Authorization': `Bearer ${token}`
            }
        };
        return rp.get(url, options);
    }
}

module.exports = AuthorizationResource;
