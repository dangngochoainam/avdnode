const Keygrid = require("keygrip");
const keys = require("../../config/keys");
const Buffer = require('safe-buffer').Buffer
module.exports = (user) => {
    const sessionObject = {
        passport: {
            user: user._id.toString(),
        }
    }

    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')

    const keygrid = new Keygrid([keys.cookieKey])
    const sig = keygrid.sign('session=' + session)

    return {
        session: session,
        sig
    }
}
