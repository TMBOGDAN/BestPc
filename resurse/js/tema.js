console.log("Scriptul tema.js este încărcat!");
document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.getElementById("themeSwitch");
    const themeIcon = document.getElementById("themeIcon");
  
    if (!themeSwitch || !themeIcon) {
      console.error("Elementele pentru schimbarea temei nu au fost găsite!");
      return;
    }
  
    // Verifică tema salvată
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeSwitch.checked = (currentTheme === "dark");
  
    // Actualizează iconița la încărcare
    updateIcon(currentTheme);
  
    // Schimbă tema la click
    themeSwitch.addEventListener("change", () => {
      const newTheme = themeSwitch.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateIcon(newTheme);
    });
  
    // Funcție pentru actualizarea iconiței
    function updateIcon(theme) {
      if (theme === "dark") {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      } else {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      }
    }
  });
  