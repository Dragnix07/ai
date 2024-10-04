require("dotenv").config();
const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

const app = express();
const port = process.env.PORT || 5001;

/*************  ✨ Codeium Command 🌟  *************/
//configure multer
app.use(express.json({ limit: "50mb" }));
/******  4fff3ba0-2b43-47b0-82de-02c36ade0df7  *******/
const upload = multer({ dest: "upload/" });
app.use(express.json({ limit: "10mb" }));

// Initialize i18next
i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, 'locales', '{{lng}}.json')
    }
  });

//routes
//analyze
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imagePath = req.file.path;
    const imageData = await fsPromises.readFile(imagePath, {
      encoding: "base64",
    });

    const language = req.body.language || 'en';
    i18next.changeLanguage(language);

    // Use the Gemini model to analyze the image
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([
      i18next.t('analyzePrompt', { lng: language }),
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const plantInfo = result.response.text();

    // Clean up: delete the uploaded file
    await fsPromises.unlink(imagePath);

    // Respond with the analysis result and the image data
    res.json({
      result: plantInfo,
      image: `data:${req.file.mimetype};base64,${imageData}`,
      language: language
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: "An error occurred while analyzing the image", details: error.message });
  }
});

//download pdf
app.post("/download", express.json(), async (req, res) => {
  const { result, image, language } = req.body;
  try {
    //Ensure the reports directory exists
    const reportsDir = path.join(__dirname, "reports");
    await fsPromises.mkdir(reportsDir, { recursive: true });
    //generate pdf
    const filename = `plant_analysis_report_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    const doc = new PDFDocument();
    doc.pipe(writeStream);

    i18next.changeLanguage(language);

    // Add content to the PDF
    doc.fontSize(24).text(i18next.t('reportTitle', { lng: language }), {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(24).text(i18next.t('dateLabel', { lng: language }) + `: ${new Date().toLocaleDateString(language)}`);
    doc.moveDown();
    doc.fontSize(14).text(result, { align: "left" });

    //insert image to the pdf
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      doc.moveDown();
      doc.image(buffer, {
        fit: [500, 300],
        align: "center",
        valign: "center",
      });
    }
    doc.end();

    //wait for the pdf to be created
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading PDF:", err);
        res.status(500).json({ error: "Error downloading the PDF report", details: err.message });
      }
      fsPromises.unlink(filePath).catch(err => console.error("Error deleting PDF file:", err));
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({ error: "An error occurred while generating the PDF report", details: error.message });
  }
});
//start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
