// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const sass = require('sass');
const app = express();
const port = 3000;
const pg=require('pg');
const { title } = require('process');
const Client=pg.Client;




const knex = require('knex')({
  client:'pg',
  connection:{
    host:'localhost',
    user:'postgres',
    password:'parola123',
    database:'postgres',
    port:5433 ,
  
  }
});

//inceput








app.get("/produse", async (req, res) => {
  try {
    // Obținem categoriile (majoră și subcategorie)
    const categories = await knex.raw(`
      SELECT unnest(enum_range(NULL::categ_produse)) AS categorie
    `);

    const subcategories = await knex.raw(`
      SELECT unnest(enum_range(NULL::tipuri_produse)) AS subcategorie
    `);

    let query = knex("produse");

    // FILTRARE: Categorie (categ_produse)
    const categorieSelectata = req.query.categorie || "toate";
    if (categorieSelectata !== "toate") {
      query.where("categorie_mare", categorieSelectata);
    }

    // FILTRARE: Subcategorie (tipuri_produse)
    const subcategorieSelectata = req.query.subcategorie || "oricare";
    if (subcategorieSelectata !== "oricare") {
      query.where("subcategorie", subcategorieSelectata);
    }

    // FILTRARE: Nume produs (caută produsele care conțin termenul introdus)
    if (req.query.nume) {
      query.whereRaw(`nume ILIKE ?`, [`%${req.query.nume}%`]);
    }

    // FILTRARE: Preț (range)
    if (req.query.pret_min && req.query.pret_max) {
      query.whereBetween("pret", [req.query.pret_min, req.query.pret_max]);
    }

    // FILTRARE: RAM (select multiplu)
    if (req.query.ram && Array.isArray(req.query.ram)) {
      query.whereIn("caracteristica_numeric_1", req.query.ram);
    }

    // FILTRARE: Stocare (select multiplu)
    if (req.query.stocare && Array.isArray(req.query.stocare)) {
      query.whereIn("caracteristica_numeric_2", req.query.stocare);
    }

    // FILTRARE: Reduceri (radio)
    if (req.query.reduceri) {
      if (req.query.reduceri === "true") {
        query.where("caracteristica_booleana", true);
      } else if (req.query.reduceri === "false") {
        query.where("caracteristica_booleana", false);
      }
    }

   // FILTRARE: Culoare (checkbox-uri)
if (req.query.culoare) {
  let culori = Array.isArray(req.query.culoare) ? req.query.culoare : [req.query.culoare];
  console.log("Filtru culori aplicat:", culori);  // DEBUG
  query.whereIn("culoare", culori);
}

// BACKEND: Sortare în funcție de preț
if (req.query.sort) {
  let ord = req.query.sort === "asc" ? "asc" : "desc";
  query.orderBy("pret", ord);
}
    // Execută interogarea pentru a obține produsele
    const produse = await query;

    // Verifică dacă au fost găsite produse
    const nuSuntProduse = produse.length === 0;

    res.render("pagini/produse", {
      produse,
      categories: categories.rows.map(row => row.categorie),
      subcategories: subcategories.rows.map(row => row.subcategorie),
      categorieSelectata,
      subcategorieSelectata,
      ipUtilizator: req.ip,
      nuSuntProduse, // Adaugă această variabilă pentru a verifica dacă nu există produse
      title: "Lista Produse"
    });
  } catch (err) {
    console.error("Eroare la interogare:", err);
    res.status(500).send("Eroare server");
  }
});







app.get("/produs/:id", (req, res) => {
  let idProdus = parseInt(req.params.id); // Convertim ID-ul în număr

  if (isNaN(idProdus)) {
    return res.status(400).send("ID invalid"); // Verificăm dacă e un număr valid
  }

  knex("produse")
    .where({ id: idProdus }) // 'id' trebuie să fie numele corect al coloanei din SQL
    .first() // Luăm un singur produs
    .then((produs) => {
      if (!produs) {
        return res.status(404).send("Produsul nu a fost găsit");
      }
      res.render("pagini/produs", {
        produs: produs,
        ipUtilizator: req.ip,
        title: produs.nume || "Detalii Produs",
      });
    })
    .catch((err) => {
      console.error("Eroare la interogare:", err);
      res.status(500).send("Eroare server");
    });
});



//sfarsit

// Define the folder for static resources
app.use('/resurse', express.static(path.join(__dirname, 'resurse')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define the path for views
app.set('views', path.join(__dirname, 'views'));

// Global object
const obGlobal = {
  obErori: null
};

// Initialize errors
function initErori() {
  const erori = JSON.parse(fs.readFileSync(path.join(__dirname, 'resurse', 'json', 'erori.json'), 'utf8'));

  // Adjust the absolute path for images
  erori.info_erori.forEach(eroare => {
    if (!eroare.imagine.startsWith(erori.cale_baza)) {
      eroare.imagine = path.posix.join(erori.cale_baza, eroare.imagine);
    }
  });

  // Adjust the default error image path
  if (!erori.eroare_default.imagine.startsWith(erori.cale_baza)) {
    erori.eroare_default.imagine = path.posix.join(erori.cale_baza, erori.eroare_default.imagine);
  }

  obGlobal.obErori = erori;
}

// Call initErori to load errors into memory
initErori();

// Add code to create folders if they don't exist
const vect_foldere = ['temp', 'backup/css'];

vect_foldere.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder creat: ${folderPath}`);
  } else {
    console.log(`Folderul există deja: ${folderPath}`);
  }
});

// SCSS to CSS compilation function
const folderScss = path.join(__dirname, 'resurse', 'scss');
const folderCss = path.join(__dirname, 'resurse', 'css');

// Function to compile SCSS to CSS with source map generation
function compileazaScss(caleScss, caleCss) {
  const inputPath = path.isAbsolute(caleScss) ? caleScss : path.join(folderScss, caleScss);
  const outputPath = path.isAbsolute(caleCss) ? caleCss : path.join(folderCss, caleCss || path.basename(caleScss, '.scss') + '.css');

  // Backup existing CSS file
  const backupFolder = path.join(__dirname, 'resurse', 'backup', 'css');
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(backupFolder, path.basename(outputPath));
    fs.copyFile(outputPath, backupPath, (err) => {
      if (err) {
        console.error('Eroare la copierea fișierului CSS:', err);
      } else {
        console.log(`Fișierul CSS vechi a fost salvat în backup: ${backupPath}`);
      }
    });
  }

  // Compile SCSS to CSS with source map generation
  sass.render({
    file: inputPath,
    outFile: outputPath, // specify the output file
    sourceMap: true,      // enable source map generation
    sourceMapEmbed: true, // embed the source map inside the CSS file
  }, (err, result) => {
    if (err) {
      console.error('Eroare la compilarea SCSS:', err);
      return;
    }

    // Write the CSS file
    fs.writeFile(outputPath, result.css, (err) => {
      if (err) {
        console.error('Eroare la salvarea fișierului CSS:', err);
      } else {
        console.log(`Fișierul CSS a fost salvat: ${outputPath}`);
      }
    });

    // Write the source map
    const sourceMapPath = outputPath + '.map'; // source map file will have the same name as the CSS file with .map extension
    fs.writeFile(sourceMapPath, result.map, (err) => {
      if (err) {
        console.error('Eroare la salvarea fișierului Source Map:', err);
      } else {
        console.log(`Fișierul Source Map a fost salvat: ${sourceMapPath}`);
      }
    });
  });
}

// Initial compilation of all SCSS files
fs.readdirSync(folderScss).forEach(file => {
  if (path.extname(file) === '.scss') {
    const scssPath = path.join(folderScss, file);
    const cssPath = path.join(folderCss, path.basename(file, '.scss') + '.css');
    compileazaScss(scssPath, cssPath);
  }
});

// Watch for changes in the SCSS folder and recompile when a file is modified
fs.watch(folderScss, (eventType, filename) => {
  if (eventType === 'change' && path.extname(filename) === '.scss') {
    const scssPath = path.join(folderScss, filename);
    const cssPath = path.join(folderCss, path.basename(filename, '.scss') + '.css');
    compileazaScss(scssPath, cssPath);
  }
});

// Function to display errors
function afisareEroare(res, identificator, titlu = null, text = null, imagine = null) {
  let eroare;

  // Look for the error with the specified identifier
  if (identificator) {
    eroare = obGlobal.obErori.info_erori.find(e => e.identificator === identificator);
  }

  // If the error is not found, use the default error
  if (!eroare) {
    eroare = obGlobal.obErori.eroare_default;
  }

  // Override JSON data with arguments if provided
  const titluFinal = titlu || eroare.titlu;
  const textFinal = text || eroare.text;
  const imagineFinal = imagine || eroare.imagine;

  // Render the error page
  res.status(eroare.status || 500).render('pagini/eroare', {
    titlu: titluFinal,
    text: textFinal,
    imagine: imagineFinal,
    cale_baza: '/resurse'
  });
}

// Galerie route handling
const caleJSON = path.join(__dirname, 'resurse', 'json', 'galerie.json');
const caleDestinatie = path.join(__dirname, 'resurse', 'imagini', 'galerie');

app.get('/galerie', (req, res) => {
  const ipUtilizator = req.ip; // Obține IP-ul utilizatorului

  fs.readFile(caleJSON, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading galerie.json:', err);
      afisareEroare(res, 500); // Default error for server issues
      return;
    }

    const galerie = JSON.parse(data);
    const oraCurenta = new Date().getHours();

    // Procesează imaginile: calculează vizibilitatea și limitează la 12
    const imagini = galerie.imagini
      .map(imagine => {
        const interval = imagine.timp.split('-');
        const esteVizibila = oraCurenta >= parseInt(interval[0]) && oraCurenta <= parseInt(interval[1]);
        return { ...imagine, esteVizibila }; // Adaugă statusul vizibilității
      })
      .slice(0, 12); // Limitează la 12 imagini

    // Redimensionează imaginile, dacă nu sunt deja redimensionate
    imagini.forEach(imagine => {
      const caleSursa = path.join(__dirname, 'resurse', galerie.cale_galerie, imagine.cale_imagine);
      const caleRedimensionata = path.join(caleDestinatie, imagine.cale_imagine);

      if (!fs.existsSync(caleRedimensionata)) {
        sharp(caleSursa)
          .resize(400)
          .toFile(caleRedimensionata, (err, info) => {
            if (err) console.error('Error resizing image:', err);
          });
      }
    });

    // Redă pagina galerie cu imaginile și alte date necesare
    res.render('pagini/galerie', {
      imagini,
      caleImagini: '/resurse/imagini/galerie/',
      title: 'Galerie',
      ipUtilizator // Transmite și IP-ul utilizatorului
    });
  });
});

// Handle the root and index paths
app.get(['/', '/index', '/home'], (req, res) => {
  res.render('pagini/index', {
    ipUtilizator: req.ip,  // Pass the IP address of the user to the view
    title: 'Home Page'     // Pass the title variable to the view
  });
});

// Handle the /istoric path
app.get('/istoric', (req, res) => {
  res.render('pagini/istoric', {
    ipUtilizator: req.ip,  // Pass the IP address of the user to the view
    title: 'Istoric'       // Pass the title variable to the view
  });
});



//etapa 6



//final

// Server error handling
app.use((req, res, next) => {
  afisareEroare(res, 404); // Default error for 404
});

// Start the server
app.listen(port, () => {
  console.log(`Serverul rulează pe http://localhost:${port}`);
});
