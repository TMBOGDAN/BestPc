-- Ștergere tipuri de date (enum) existente
DROP TYPE IF EXISTS categ_produse;
DROP TYPE IF EXISTS tipuri_produse;

-- Crearea enum-urilor pentru categorii
CREATE TYPE categ_produse AS ENUM('Calculator', 'Laptop', 'All-in-One');
CREATE TYPE tipuri_produse AS ENUM('Gaming', 'Desktop', 'Ultraportabil', 'Profesional', 'Touchscreen', 'Slim', 'Compact', 'Deluxe');

-- Crearea tabelului produse
CREATE TABLE IF NOT EXISTS produse (
   id SERIAL PRIMARY KEY,
   nume VARCHAR(100) UNIQUE NOT NULL,
   descriere TEXT,
   imagine VARCHAR(300),
   categorie_mare categ_produse NOT NULL,
   subcategorie tipuri_produse NOT NULL,
   pret NUMERIC(10, 2) NOT NULL CHECK (pret > 0),
   caracteristica_numeric_1 INT CHECK (caracteristica_numeric_1 >= 0), -- Ex. RAM în GB
   caracteristica_numeric_2 INT CHECK (caracteristica_numeric_2 >= 0), -- Ex. Stocare în GB
   data_inregistrare DATE DEFAULT CURRENT_DATE,
   culoare VARCHAR(30),
   caracteristici_multiple TEXT, -- Ex. Detalii suplimentare
   caracteristica_booleana BOOLEAN DEFAULT FALSE -- Ex. Disponibilitate/reducere
);

--produse
INSERT INTO produse (nume, descriere, imagine, categorie_mare, subcategorie, pret, caracteristica_numeric_1, caracteristica_numeric_2, culoare, caracteristici_multiple, caracteristica_booleana)
VALUES

('Desktop Gaming X1', 'PC de gaming performant', '/imagine1.jpg', 'Calculator', 'Gaming', 5500.00, 8, 512, 'Negru', 'Placă video RTX 4070, Procesor i7', TRUE),
('Desktop High-End', 'Desktop profesional pentru lucru și gaming', '/imagine2.jpg', 'Calculator', 'Desktop', 7200.00, 16, 1024, 'Negru', 'Procesor i9, Stocare SSD NVMe', TRUE),
('Desktop Workstation', 'Stație de lucru puternică', '/imagine3.jpg', 'Calculator', 'Desktop', 12000.00, 16, 2048, 'Argintiu', 'Placă video Quadro RTX 5000', TRUE),
('Desktop RGB Ultra', 'Desktop gaming cu iluminare RGB', '/imagine4.jpg', 'Calculator', 'Gaming', 4800.00, 32, 2048, 'Negru', 'Carcasă RGB, Răcire avansată', TRUE),
('Desktop Compact Mini', 'PC desktop compact pentru spații mici', '/imagine5.jpg', 'Calculator', 'Desktop', 3500.00, 64, 4096, 'Alb', 'Dimensiuni reduse, Performanță ridicată', FALSE),
('Laptop Gaming Titan', 'Laptop cu placă video dedicată', '/imagine6.jpg', 'Laptop', 'Gaming', 6800.00, 8, 512, 'Negru', 'Ecran 240Hz, RTX 4080', TRUE),
('Laptop Ultraportabil X2', 'Laptop ușor și subțire', '/imagine7.jpg', 'Laptop', 'Ultraportabil', 2800.00, 8, 256, 'Argintiu', 'Autonomie 15 ore, Greutate 1.2 kg', TRUE),
('Laptop Profesional Pro', 'Laptop profesional cu ecran 4K', '/imagine8.jpg', 'Laptop', 'Profesional', 5200.00, 32, 1024, 'Negru', 'Procesor i9, Display 4K OLED', FALSE),
('Laptop Slim Edition', 'Laptop elegant cu performanță ridicată', '/imagine9.jpg', 'Laptop', 'Ultraportabil', 4000.00, 16, 512, 'Albastru', 'Baterie 18 ore, Design subțire', TRUE),
('Laptop Deluxe Master', 'Laptop premium cu materiale de calitate', '/imagine10.jpg', 'Laptop', 'Profesional', 7400.00, 64, 2048, 'Negru', 'Construcție metalică, Touchscreen', TRUE),
('All-in-One Touch Master', 'Sistem All-in-One cu touchscreen', '/imagine11.jpg', 'All-in-One', 'Touchscreen', 4200.00, 8, 512, 'Negru', 'Ecran 4K, Funcționalitate touchscreen', TRUE),
('All-in-One Slim Pro', 'Sistem All-in-One slim pentru birou', '/imagine12.jpg', 'All-in-One', 'Slim', 2500.00, 8, 512, 'Alb', 'Design ultra-subțire, Conectivitate Wi-Fi', TRUE),
('All-in-One Compact', 'Un sistem All-in-One compact pentru birou mic', '/imagine13.jpg', 'All-in-One', 'Compact', 1800.00, 8, 256, 'Alb', 'Carcasă mică, Porturi USB 3.0', FALSE),
('All-in-One Deluxe', 'Sistem All-in-One cu performanță ridicată', '/imagine14.jpg', 'All-in-One', 'Deluxe', 5500.00, 32, 2048, 'Negru', 'Placă video RTX 4090, Ecran 4K', TRUE),
('All-in-One Ultra 5K', 'Sistem premium cu display 5K', '/imagine15.jpg', 'All-in-One', 'Deluxe', 6800.00, 64, 2048, 'Argintiu', 'Ecran Retina 5K, Performanță maximă', TRUE);
