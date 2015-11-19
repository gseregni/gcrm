'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/galimberticrm'
  },

  swiHighriseUrl: "https://swissgalimbertisa.highrisehq.com",
  itaHighriseUrl: "https://galimbertisrl1.highrisehq.com",

  trelloKey:    "4511c7f07fcb5a5cd12d118ddd84cedf",
  trelloSecret:   "03a69ace93d189e4da569ffa56805d9b179a4b38f9a120e08ecc715696b7c71f"
};