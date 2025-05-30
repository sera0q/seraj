// detectCountry.js

export async function detectChina() {
  // Check if already stored in session
  const cached = sessionStorage.getItem("isInChina");
  if (cached !== null) {
    return cached === "true";
  }

  try {
    const response = await fetch("https://ipapi.co/json");
    const data = await response.json();
    const isInChina = data.country_code === "CN";
    sessionStorage.setItem("isInChina", isInChina);
    return isInChina;
  } catch (err) {
    console.warn("Geo check failed. Defaulting to not-China.");
    sessionStorage.setItem("isInChina", false);
    return false;
  }
}
