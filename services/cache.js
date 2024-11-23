const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');
const util = require("node:util");
const client = redis.createClient(keys.redisUrl)

client.hget = util.promisify(client.hget)

const exec = mongoose.Query.prototype.exec
mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}));

    const cacheValue = await client.hget(this.hashKey, key)
    if(cacheValue) {
        const parsedValue = JSON.parse(cacheValue);
        return Array.isArray(parsedValue) ? parsedValue.map(v => new this.model(v)) : new this.model(parsedValue);
    }

    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result));

    return result;
}

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || '')
    return this
}

function clearHash(key) {
    client.del(JSON.stringify(key))
}
module.exports = {
    clearHash
}
