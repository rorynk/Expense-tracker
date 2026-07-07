const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.0keyfhe.mongodb.net",
  (err, records) => {
    console.log("ERR:", err);
    console.log("RECORDS:", records);
  }
);