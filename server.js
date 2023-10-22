const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const officegen = require('officegen');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== '.pdf' && ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only PDF, PNG, JPG, and JPEG files are allowed'));
        }
        callback(null, true);
    }
});

app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const xlsx = officegen('docx');

    const table = xlsx.makeTable(2, 2);
    table.style = 'MediumGrid1Accent2';
    table.setCellText(1, 1, 'Cell 1,1');
    table.setCellText(1, 2, 'Cell 1,2');
    table.setCellText(2, 1, 'Cell 2,1');
    table.setCellText(2, 2, 'Cell 2,2');

    const docx = fs.createWriteStream('public/output.docx');
    xlsx.generate(docx);

    res.sendFile(path.join(__dirname, 'public', 'output.docx'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
