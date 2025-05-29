import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    const { projectName } = req.body;

    if (!projectName) {
        return res.status(400).json({ error: 'projectName is required' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const folderMetadata = {
            name: projectName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['1o07OIt9PMh6K5MoKCCbQKpCR8rv9ue8b'],
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id',
        });

        const folderId = folder.data.id;
        const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

        res.status(200).json({ status: 'success', folderLink });
    } catch (error) {
        console.error('Drive Error:', error.message);
        res.status(500).json({ error: error.message });
    }
}