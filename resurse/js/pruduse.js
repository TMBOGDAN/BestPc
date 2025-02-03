let timeout;

function sorteaza(ord) {
    let params = new URLSearchParams(window.location.search);
    params.set("sort", ord);
    window.location.search = params.toString();
}

function aplicaFiltre() {
    let form = document.getElementById("filtre-form");
    form.submit();
}

function reseteazaFiltre() {
    window.location.href = window.location.pathname;
}

function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // Nume
    let nume = urlParams.get("nume");
    if (nume) document.getElementById("nume").value = nume;

    // Preț (dacă nu există în URL, folosim valorile implicite)
    let pretMin = urlParams.get("pret_min") || "0";
    let pretMax = urlParams.get("pret_max") || "15000";
    document.getElementById("pret_min").value = pretMin;
    document.getElementById("pret_min_label").innerText = pretMin;
    document.getElementById("pret_max").value = pretMax;
    document.getElementById("pret_max_label").innerText = pretMax;

    // Categorie mare
    let categorie = urlParams.get("categorie");
    if (categorie) document.getElementById("categorie").value = categorie;

    // Subcategorie
    let subcategorie = urlParams.get("subcategorie");
    if (subcategorie) document.getElementById("subcategorie").value = subcategorie;

    // RAM
    let ramValues = urlParams.getAll("ram[]");
    let ramSelect = document.getElementById("ram");
    for (let option of ramSelect.options) {
        option.selected = ramValues.includes(option.value);
    }

    // Stocare
    let stocareValues = urlParams.getAll("stocare[]");
    let stocareSelect = document.getElementById("stocare");
    for (let option of stocareSelect.options) {
        option.selected = stocareValues.includes(option.value);
    }

    // Reduceri
    let reducere = urlParams.get("reduceri");
    if (reducere) {
        let reduceriRadios = document.getElementsByName("reduceri");
        for (let radio of reduceriRadios) {
            radio.checked = radio.value === reducere;
        }
    }

    // Culoare
    let culoriSelectate = urlParams.getAll("culoare");
    let checkboxes = document.querySelectorAll("input[name='culoare']");
    checkboxes.forEach(checkbox => {
        checkbox.checked = culoriSelectate.includes(checkbox.value);
    });
}

function filtreaza() {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        let params = new URLSearchParams();

        // Nume
        let nume = document.getElementById("nume").value;
        if (nume) params.set("nume", nume);

        // Preț (dacă nu e setat, folosim valorile implicite)
        let pretMin = document.getElementById("pret_min").value || "0";
        let pretMax = document.getElementById("pret_max").value || "15000";
        params.set("pret_min", pretMin);
        params.set("pret_max", pretMax);

        // Categorie
        let categorie = document.getElementById("categorie").value;
        if (categorie !== "toate") params.set("categorie", categorie);

        // Subcategorie
        let subcategorie = document.getElementById("subcategorie").value;
        if (subcategorie !== "oricare") params.set("subcategorie", subcategorie);

        // RAM
        let ramSelect = document.getElementById("ram");
        let ramValues = [...ramSelect.selectedOptions].map(opt => opt.value);
        ramValues.forEach(val => params.append("ram[]", val));

        // Stocare
        let stocareSelect = document.getElementById("stocare");
        let stocareValues = [...stocareSelect.selectedOptions].map(opt => opt.value);
        stocareValues.forEach(val => params.append("stocare[]", val));

        // Reduceri
        let reduceriRadio = document.querySelector("input[name='reduceri']:checked");
        if (reduceriRadio) params.set("reduceri", reduceriRadio.value);

        // Culoare
        let selectedColors = [...document.querySelectorAll("input[name='culoare']:checked")].map(cb => cb.value);
        selectedColors.forEach(color => params.append("culoare", color));

        // Actualizare URL fără a reseta valorile
        window.location.search = params.toString();
    }, 500);
}

function updatePret() {
    let pretMinInput = document.getElementById("pret_min");
    let pretMaxInput = document.getElementById("pret_max");

    document.getElementById("pret_min_label").innerText = pretMinInput.value;
    document.getElementById("pret_max_label").innerText = pretMaxInput.value;

    filtreaza();
}

// Apelăm funcția pentru a aplica filtrele la încărcarea paginii
window.onload = applyFiltersFromURL;
