
        document.addEventListener("DOMContentLoaded", async function() {
            const jsonDirectory = '/list-json-files';
            const dataArray = []; // Tableau pour stocker les données

            const loadJSON = (file) => {
                return fetch(`/json-files/${file}`)
                    .then(response => response.json())
                    .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));
            };

            const createTable = (data) => {
                // Créer les lignes du tableau
                const mediaCount = data.node.edge_sidecar_to_children ? data.node.edge_sidecar_to_children.edges.length : 1;
                const likeCount = data.node.edge_media_preview_like.count || 0;
                const commentCount = data.node.edge_media_to_comment ? data.node.edge_media_to_comment.count : 0;
                const shareCount = data.node.edge_media_to_share ? data.node.edge_media_to_share.count : 'N/A';
                const videoCount = data.node.edge_sidecar_to_children ? data.node.edge_sidecar_to_children.edges.filter(edge => edge.node.is_video).length : 0;
                const timestamp = new Date(data.node.taken_at_timestamp * 1000);
                const date = timestamp.toLocaleDateString('fr-FR');
                const time = timestamp.toLocaleTimeString('fr-FR');
                const location = data.node.location ? data.node.location.name : '-';
                const caption = data.node.edge_media_to_caption.edges.length > 0 ? data.node.edge_media_to_caption.edges[0].node.text : '';
                const wordCount = caption.trim() === '' ? 0 : caption.split(/\s+/).length;
                const linkMatches = caption.match(/\bhttps?:\/\/\S+/gi) || [];
                const mentionMatches = caption.match(/@\w+/g) || [];
                const hashTagMatches = caption.match(/#[^\s#]*/g) || [];
                const linkCount = linkMatches.length + mentionMatches.length; // Total des liens et mentions
                const hashTagCount = hashTagMatches.length;
                const modifiedCaption = caption
                    .replace(/\bhttps?:\/\/\S+/gi, "$&")
                    .replace(/(@\w+)/g, "$1")
                    .replace(/(#[^\s#]*)/g, "$1");
                const author = data.node.owner.username; // Nom de l'auteur
                const visitDate = new Date().toLocaleDateString('fr-FR'); // Date de visite
                const rowData = [author, date, time, location, mediaCount, videoCount, linkCount, hashTagCount, modifiedCaption, wordCount, likeCount, commentCount, visitDate];

                // Stocker les données dans le tableau (array)
                dataArray.push(rowData);

                // Créer le tableau HTML
                const table = document.createElement('table');
                table.border = '1';

                // Créer les en-têtes du tableau
                const headers = ['Auteur', 'Date de publication', 'Heure de publication', 'Lieu de publication', 'Photos', 'Vidéos', 'Liens', 'Hashtags', 'Légende', 'Nombre de mots', 'Likes', 'Commentaires', 'Date de visite'];
                const thead = document.createElement('thead');
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    tr.appendChild(th);
                });
                thead.appendChild(tr);
                table.appendChild(thead);

                // Créer les lignes du tableau
                const tbody = document.createElement('tbody');
                const trBody = document.createElement('tr');
                rowData.forEach((item, index) => {
                    const td = document.createElement('td');
                    if (index === 8) { // Légende
                        td.innerHTML = item;
                    } else {
                        td.textContent = item || 0;
                    }
                    trBody.appendChild(td);
                });
                tbody.appendChild(trBody);
                table.appendChild(tbody);

                return table;
            };

            const displayJSONData = async () => {
                const container = document.getElementById('json-table-container');

                // Récupérer la liste des fichiers JSON depuis le serveur
                const response = await fetch(jsonDirectory);
                const jsonFiles = await response.json();

                for (let file of jsonFiles) {
                    const data = await loadJSON(file);
                    if (data) {
                        const table = createTable(data);
                        container.appendChild(table);
                        container.appendChild(document.createElement('br')); // Ajouter une ligne de séparation entre les tableaux
                    }
                }
            };

            console.log(dataArray);

            // Fonction pour exporter vers Excel
            const exportToExcel = () => {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet([['Auteur', 'Date de publication', 'Heure de publication', 'Lieu de publication', 'Photos', 'Vidéos', 'Liens', 'Hashtags', 'Légende', 'Nombre de mots', 'Likes', 'Commentaires', 'Date de visite'], ...dataArray]);
                XLSX.utils.book_append_sheet(wb, ws, 'Data');
                XLSX.writeFile(wb, `${dataArray[0][0]}.xlsx`);
            };

            // Ajout d'un bouton pour exporter vers Excel
            const exportButton = document.createElement('button');
            exportButton.textContent = 'Exporter vers Excel';
            exportButton.addEventListener('click', exportToExcel);
            document.body.appendChild(exportButton);

            // Appel de la fonction pour afficher les données JSON
            await displayJSONData();
        });
