const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const jsonDirectory = path.join(__dirname, 'json-files');

// Servir les fichiers statiques du dossier 'public'
app.use(express.static('public'));

// Route pour lister les fichiers JSON
app.get('/list-json-files', (req, res) => {
    fs.readdir(jsonDirectory, (err, files) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du répertoire');
        }
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        res.json(jsonFiles);
    });
});

// Route pour obtenir le contenu d'un fichier JSON
app.get('/json-files/:filename', (req, res) => {
    const filePath = path.join(jsonDirectory, req.params.filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
