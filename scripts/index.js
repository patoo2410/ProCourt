document.querySelectorAll(".iniciar").forEach((btn) =>
  btn.addEventListener("click", () => {
    sessionStorage.setItem("seleccionado", "Iniciar sesion");
    window.location.href = "auth.html";
  }),
);

document.querySelectorAll(".crear").forEach((btn) =>
  btn.addEventListener("click", () => {
    sessionStorage.setItem("seleccionado", "Crear cuenta");
    window.location.href = "auth.html";
  }),
);