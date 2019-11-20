const axios = require("axios");

exports.getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
        return null;
    }
};