const PROXY_CONFIG = [{
  context: ['/api'],
  target: 'https://budgetapi-apim.azure-api.net',
  secure: true,
  logLevel: 'debug'

}];

module.exports = PROXY_CONFIG;
