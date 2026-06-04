const dns = require("dns");

dns.lookup("generativelanguage.googleapis.com", (err, address, family) => {
  if (err) {
    console.error("dns.lookup failed:", err);
  } else {
    console.log("dns.lookup success:", address, family);
  }
});

dns.resolve4("generativelanguage.googleapis.com", (err, addresses) => {
  if (err) {
    console.error("dns.resolve4 failed:", err);
  } else {
    console.log("dns.resolve4 success:", addresses);
  }
});
