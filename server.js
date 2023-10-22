const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const htmlToPdf = require('html-pdf');

const app = express();

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.pdf');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const ext = file.originalname.toLowerCase();
        if (!ext.match(/\.(jpg|jpeg|png|pdf)$/)) {
            return callback(new Error('Only JPG, JPEG, PNG, and PDF files are allowed'));
        }
        callback(null, true);
    }
});

app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const inputFilePath = req.file.path;

    if (inputFilePath.endsWith('.pdf')) {
        // PDF to Word conversion
        const outputFilePath = 'public/output.docx';

        mammoth.convertToHtml({ path: inputFilePath })
            .then(result => {
                return mammoth.convertToDocx({ array: result.value });
            })
            .then(docx => {
                docx.write(outputFilePath);
                res.download(outputFilePath);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Conversion failed.');
            });
    } else {
        // Image to Word conversion
        res.status(400).send('Only PDF files are supported for conversion.');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
