const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Define route to serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/aar_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define AAR schema and model to include title for AARs and chapters
const AARSchema = new mongoose.Schema({
  aarTitle: String, // Title for the AAR
  chapters: [
    {
      chapterTitle: String, // Title for the chapter
      narrative: String,
      image: String,
    },
  ],
});
const AAR = mongoose.model("AAR", AARSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Define routes
app.post("/api/aars", async (req, res) => {
  try {
    const { title } = req.body;
    const newAAR = new AAR({ title });
    await newAAR.save();
    res.status(201).json(newAAR);
  } catch (error) {
    console.error("Error creating AAR:", error);
    res.status(500).send("Error creating AAR");
  }
});

app.post(
  "/api/aars/:aarId/chapters",
  upload.single("image"),
  async (req, res) => {
    try {
      const { aarId } = req.params;
      const { title, narrative } = req.body;
      const image = req.file ? req.file.path : null;
      const aar = await AAR.findById(aarId);
      if (!aar) {
        return res.status(404).send("AAR not found");
      }
      aar.chapters.push({ title, narrative, image });
      await aar.save();
      res.status(201).json(aar);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).send("Error creating chapter");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
