const localtunnel = require('localtunnel');

const getTunnel = async () => {
    const tunnel = await localtunnel({ port: 80 });
    return tunnel.url
};

export { getTunnel }