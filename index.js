const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Drive API Auth
const auth = new google.auth.GoogleAuth({
    keyFile: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// 📁 POST route to create folder and return its link
app.post("/create-folder", async (req, res) => {
    const { projectName } = req.body;

    if (!projectName) {
        return res.status(400).json({ error: "projectName is required" });
    }

    try {
        const folderMetadata = {
            name: projectName,
            mimeType: "application/vnd.google-apps.folder",
            parents: ["1o07OIt9PMh6K5MoKCCbQKpCR8rv9ue8b"], // your parent folder ID
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: "id",
        });

        const folderId = folder.data.id;
        const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

        res.json({ status: "success", folderLink });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Optional: Test GET route
app.get("/", (req, res) => {
    res.status(200).json("SWS Drive API Running");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});



// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { google } = require("googleapis");
// const admin = require("firebase-admin");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Initialize Firebase Admin
// const serviceAccount = require(process.env.GOOGLE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// // Initialize Google Drive API
// const auth = new google.auth.GoogleAuth({
//     keyFile: process.env.GOOGLE_SERVICE_ACCOUNT,
//     scopes: ["https://www.googleapis.com/auth/drive"],
// });

// const drive = google.drive({ version: "v3", auth });

// // POST endpoint to create folder and update Firestore
// app.post("/create-folder", async (req, res) => {
//     const { projectId, projectName } = req.body;

//     if (!projectId || !projectName) {
//         return res.status(400).json({ error: "projectId and projectName are required" });
//     }

//     try {
//         // Create folder in Drive
//         const folderMetadata = {
//             name: projectName,
//             mimeType: "application/vnd.google-apps.folder",
//             parents: ["1o07OIt9PMh6K5MoKCCbQKpCR8rv9ue8b"], // your parent folder ID
//         };

//         const folder = await drive.files.create({
//             resource: folderMetadata,
//             fields: "id",
//         });

//         const folderId = folder.data.id;
//         const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

//         // Update Firestore project doc
//         await db
//             .collection(process.env.FIREBASE_COLLECTION)
//             .doc(projectId)
//             .update({ projectFolder: folderLink });

//         res.json({ status: "success", folderLink });
//     } catch (error) {
//         console.error("Error:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get("/", (req, res) => {
//     res.status(200).json("SWS CRM Started")
// })

// app.listen(process.env.PORT, () => {
//     console.log(`Server running on port ${process.env.PORT}`);
// });
