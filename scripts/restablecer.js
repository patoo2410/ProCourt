const formulario = document.querySelector(".formulario");
const mensaje = document.getElementById("mensaje-formulario");
const btnEnviar = document.querySelector(".btn-enviar");
const contrasenaInput = document.getElementById("contrasena");
const confirmarContrasenaInput = document.getElementById("confirmar-contrasena");
const errorConfirmar = document.getElementById("error-confirmar");
const requisitosContenedor = document.getElementById("requisitos");
const requisitos = document.querySelectorAll(".requisito");
const btnOjo = document.getElementById("ver-contrasena");
const enlaceVolver = document.getElementById("volver-login");

const PAGINA_LOGIN = "auth.html";
const PAGINA_DESTINO = "rutina.html";

const hash = location.hash;
const llegoPorEnlaceDeRecuperacion = hash.includes("type=recovery");
const enlaceConError = hash.includes("error=");

function mostrarMensaje(texto, tipo = "error") {
  mensaje.textContent = texto;
  mensaje.dataset.tipo = tipo;
  mensaje.hidden = !texto;
}

function traducirError(error) {
  const m = (error.message || "").toLowerCase();
  if (m.includes("different from the old"))
    return "La nueva contraseña debe ser diferente a la anterior.";
  if (m.includes("session missing") || m.includes("expired"))
    return "El enlace expiró. Solicita uno nuevo desde «¿Olvidaste tu contraseña?».";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos.";
  if (m.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

let formularioHabilitado = false;

function habilitarFormulario() {
  if (formularioHabilitado) return;
  formularioHabilitado = true;
  mostrarMensaje("");
  formulario.hidden = false;
  contrasenaInput.focus();
}

function enlaceInvalido() {
  if (formularioHabilitado) return;
  mostrarMensaje(
    "El enlace no es válido o ya expiró. Solicita uno nuevo desde «¿Olvidaste tu contraseña?» en el inicio de sesión.",
  );
}

db.auth.onAuthStateChange((evento) => {
  if (evento === "PASSWORD_RECOVERY") habilitarFormulario();
});

if (enlaceConError) {
  enlaceInvalido();
} else {
  setTimeout(async () => {
    if (formularioHabilitado) return;
    const { data } = await db.auth.getSession();
    if (data.session && llegoPorEnlaceDeRecuperacion) habilitarFormulario();
    else enlaceInvalido();
  }, 3000);
}

btnOjo.addEventListener("click", () => {
  const mostrar = contrasenaInput.type === "password";
  const tipo = mostrar ? "text" : "password";
  contrasenaInput.type = tipo;
  confirmarContrasenaInput.type = tipo;

  btnOjo.setAttribute("aria-pressed", String(mostrar));
  btnOjo.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
  btnOjo.querySelector(".ojo-abierto").toggleAttribute("hidden", mostrar);
  btnOjo.querySelector(".ojo-cerrado").toggleAttribute("hidden", !mostrar);
});

enlaceVolver.addEventListener("click", () => {
  sessionStorage.setItem("seleccionado", "Iniciar sesion");
});

function validarContrasena() {
  let valido = true;
  const fallo = (i) => {
    requisitosContenedor.hidden = false;
    requisitos[i].hidden = false;
    valido = false;
  };

  const pass = contrasenaInput.value;
  if (!/\d/.test(pass)) fallo(0);
  if (!/[A-ZÑ]/.test(pass) || !/[a-zñ]/.test(pass)) fallo(1);
  if (!/[^A-Za-z0-9ñÑ\s]/.test(pass)) fallo(2);
  if (pass.length < 8) fallo(3);
  if (/\s/.test(pass)) fallo(4);

  if (confirmarContrasenaInput.value !== pass) {
    errorConfirmar.hidden = false;
    valido = false;
  }
  return valido;
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorConfirmar.hidden = true;
  requisitosContenedor.hidden = true;
  requisitos.forEach((r) => (r.hidden = true));
  mostrarMensaje("");

  if (!validarContrasena()) return;

  btnEnviar.disabled = true;
  try {
    const { error } = await db.auth.updateUser({ password: contrasenaInput.value });
    if (error) return mostrarMensaje(traducirError(error));

    mostrarMensaje("Contraseña actualizada. Entrando a ProCourt...", "ok");
    formulario.querySelectorAll("input").forEach((i) => (i.disabled = true));
    setTimeout(() => (location.href = PAGINA_DESTINO), 1500);
  } catch (err) {
    mostrarMensaje(traducirError(err));
  } finally {
    if (!mensaje.dataset.tipo || mensaje.dataset.tipo === "error") btnEnviar.disabled = false;
  }
});