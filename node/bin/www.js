const app = require('../app');
require('dotenv').config({ path: ".env" });

const port = 8000;

app.listen(port, () => {
  console.log('Server on ' + port);
});