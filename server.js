require('dotenv').config();
const express = require('express');
const indexRouter = require('./routes/index');
const responder = require('./services/responder');

const app = express();
const PORT = process.env.PORT || 5010;

app.use(express.json());
app.use('/', indexRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  responder.error(res, err.message || 'Internal server error', err.status || 500);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
