const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define the path to the tags.json file
const tagsFilePath = path.join(__dirname, 'public', 'data', 'tags.json');

// Endpoint for fetching images with optional branch, name, and tags filtering
app.get('/api/images', (req, res) => {
    const tags = req.query.tags ? req.query.tags.split(',').map(tag => tag.trim()) : [];
    const branche = req.query.branche || '';
    const name = req.query.name || '';

    if (!fs.existsSync(tagsFilePath)) {
        return res.status(404).json({ message: 'Tags data not found' });
    }

    const tagsData = JSON.parse(fs.readFileSync(tagsFilePath, 'utf8'));

    // Wenn keine Filter eingegeben wurden, alle Bilder anzeigen
    if (tags.length === 0 && !branche && !name) {
        return res.json(Object.keys(tagsData));
    }

    const images = [];
    for (const [image, imageData] of Object.entries(tagsData)) {
        const matchesTags = tags.length === 0 || tags.every(tag => imageData.tags.includes(tag));
        const matchesBranche = !branche || imageData.branche.toLowerCase() === branche.toLowerCase();
        const matchesName = !name || imageData.name.toLowerCase() === name.toLowerCase();

        if (matchesTags && matchesBranche && matchesName) {
            images.push(image);
        }
    }

    res.json(images);
});


// Endpoint to fetch all tags, branches, and names
app.get('/api/tags', (req, res) => {
    if (!fs.existsSync(tagsFilePath)) {
        return res.status(404).json({ message: 'Tags data not found' });
    }

    const tagsData = JSON.parse(fs.readFileSync(tagsFilePath, 'utf8'));

    const allTags = [...new Set(Object.values(tagsData).flatMap(data => data.tags))];
    const allBranches = [...new Set(Object.values(tagsData).map(data => data.branche))];
    const allNames = [...new Set(Object.values(tagsData).map(data => data.name))];

    res.json({ tags: allTags, branches: allBranches, names: allNames });
});

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'Pictures');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to filename to avoid conflicts
    }
});

// Initialize upload middleware
const upload = multer({ storage: storage });

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
    const branche = req.body.branche || 'Uncategorized';
    const name = req.body.name || 'Unnamed';
    const fileName = req.file.filename;

    // Read the existing tags.json file
    let tagsData = {};
    if (fs.existsSync(tagsFilePath)) {
        tagsData = JSON.parse(fs.readFileSync(tagsFilePath, 'utf8'));
    }

    // Add new tags to the image
    tagsData[fileName] = {
        tags: tags,
        branche: branche,
        name: name
    };

    // Write the updated data to tags.json
    fs.writeFileSync(tagsFilePath, JSON.stringify(tagsData, null, 2));

    res.json({ message: 'File uploaded successfully', fileName });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
