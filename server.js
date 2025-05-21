process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err.stack);
  console.log("UNCAUGHT EXCEPTION 💥 Shutting down server...");
  process.exit(1);
});

const app = require("./app");
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");

const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => console.log("Database Connected successfully"));

const server = app.listen(port, () => {
  console.log(`Server started on: http://127.0.0.1:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED EXCEPTION 💥 Shutting down server...");

  server.close(() => {
    process.exit(1);
  });
});
