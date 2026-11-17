const botonesAcceso = document.querySelector(".tabs");
const tabs = document.querySelectorAll(".tab");
const campos = document.querySelectorAll(".campo");
const etiqueta = document.querySelector(".bienvenida");
const tituloFormulario = document.querySelector(".titulo-formulario");
const subtitulo = document.querySelector(".subtitulo");
const btnEnviar = document.querySelector(".btn-enviar");
const formulario = document.querySelector(".formulario");
const btnRecuperar = document.getElementById("recuperar");

const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const contrasenaInput = document.getElementById("contrasena");
const confirmarContrasenaInput = document.getElementById("confirmar-contrasena");
const errorNombre = document.getElementById("error-nombre");
const errorCorreo = document.getElementById("error-correo");
const errorConfirmar = document.getElementById("error-confirmar");
const requisitosContenedor = document.getElementById("requisitos");
const requisitos = document.querySelectorAll(".requisito");

const PAGINA_DESTINO = "rutina.html";

const TEXTOS = {
  "iniciar-sesion": {
    etiqueta: "BIENVENIDO DE NUEVO",
    titulo: "INICIA SESIÓN",
    subtitulo: "Accede a tus rutinas, progreso y plantilla.",
    boton: "ENTRAR A PROCOURT  >",
  },
  registro: {
    etiqueta: "EMPIEZA TU PROCESO",
    titulo: "CREA TU CUENTA",
    subtitulo: "Crea tu espacio para entrenar o gestionar jugadores.",
    boton: "CREAR MI CUENTA",
  },
};

function cambiarTexto(elemento, texto) {
  elemento.textContent = texto;
}

function setModo(modo) {
  const esLogin = modo === "iniciar-sesion";
  const t = TEXTOS[modo];

  botonesAcceso.setAttribute("data-activo", modo);
  tabs[0].classList.toggle("tab-activa", esLogin);
  tabs[1].classList.toggle("tab-activa", !esLogin);
  tabs[0].setAttribute("aria-pressed", String(esLogin));
  tabs[1].setAttribute("aria-pressed", String(!esLogin));

  campos[0].hidden = esLogin; 
  campos[3].hidden = esLogin;
  contrasenaInput.autocomplete = esLogin ? "current-password" : "new-password";
  if (btnRecuperar) btnRecuperar.hidden = !esLogin;

  cambiarTexto(etiqueta, t.etiqueta);
  cambiarTexto(tituloFormulario, t.titulo);
  cambiarTexto(subtitulo, t.subtitulo);
  cambiarTexto(btnEnviar, t.boton);

  limpiarErrores();
  mostrarMensaje("");
}

function limpiarErrores() {
  [errorNombre, errorCorreo, errorConfirmar, requisitosContenedor].forEach(
    (el) => el && (el.hidden = true),
  );
  requisitos.forEach((r) => (r.hidden = true));
}

function mostrarMensaje(texto, tipo = "error") {
  let el = document.getElementById("mensaje-formulario");
  if (!el) {
    el = document.createElement("p");
    el.id = "mensaje-formulario";
    el.setAttribute("role", "alert");
    btnEnviar.before(el);
  }
  el.textContent = texto;
  el.dataset.tipo = tipo;
  el.hidden = !texto;
}

function traducirError(error) {
  const m = (error.message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Primero confirma tu correo (revisa tu bandeja).";
  if (m.includes("already registered")) return "Ese correo ya está registrado. Inicia sesión.";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos.";
  if (m.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

const DOMINIOS_BLOQUEADOS = [
  "10minutemail.com", "temp-mail.org", "tempmail.com", "guerrillamail.com",
  "mailinator.com", "yopmail.com", "throwawaymail.com", "fakeinbox.com",
  "trashmail.com", "getnada.com", "dispostable.com", "maildrop.cc", "mohmal.com",
];

function esNombreValido(nombre) {
  if (typeof nombre !== "string") return false;
  const limpio = nombre.trim();
  if (limpio.length < 2 || limpio.length > 60) return false;
  if (/(.)\1\1/i.test(limpio)) return false;
  const regex =
    /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü]+(?:['-][A-Za-zÑñÁáÉéÍíÓóÚúÜü]+)*(?:\s+[A-Za-zÑñÁáÉéÍíÓóÚúÜü]+(?:['-][A-Za-zÑñÁáÉéÍíÓóÚúÜü]+)*)*$/;
  return regex.test(limpio);
}

function esEmailValido(email) {
  if (typeof email !== "string") return false;
  const limpio = email.trim().toLowerCase();
  if (limpio.length < 5 || limpio.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) return false;
  return !DOMINIOS_BLOQUEADOS.includes(limpio.split("@")[1]);
}

function validarRegistro() {
  let valido = true;
  const fallo = (i) => {
    requisitosContenedor.hidden = false;
    requisitos[i].hidden = false;
    valido = false;
  };

  if (!esNombreValido(nombreInput.value)) {
    errorNombre.hidden = false;
    valido = false;
  }
  if (!esEmailValido(correoInput.value)) {
    errorCorreo.hidden = false;
    valido = false;
  }

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

const btnOjo = document.getElementById("ver-contrasena");

btnOjo?.addEventListener("click", () => {
  const mostrar = contrasenaInput.type === "password";
  contrasenaInput.type = mostrar ? "text" : "password";

  btnOjo.setAttribute("aria-pressed", String(mostrar));
  btnOjo.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");

  btnOjo.querySelector(".ojo-abierto").toggleAttribute("hidden", mostrar);
  btnOjo.querySelector(".ojo-cerrado").toggleAttribute("hidden", !mostrar);
});

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarErrores();
  mostrarMensaje("");

  const modo = botonesAcceso.getAttribute("data-activo");
  const correo = correoInput.value.trim().toLowerCase();
  const pass = contrasenaInput.value;

  if (modo === "registro") {
    if (!validarRegistro()) return;
  } else if (!correo || !pass) {
    mostrarMensaje("Escribe tu correo y tu contraseña.");
    return;
  }

  btnEnviar.disabled = true;
  try {
    if (modo === "registro") {
      const { data, error } = await db.auth.signUp({
        email: correo,
        password: pass,
        options: {
          data: { nombre: nombreInput.value.trim() },
          emailRedirectTo: new URL("auth.html", location.href).href,
        },
      });
      if (error) return mostrarMensaje(traducirError(error));

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return mostrarMensaje("Ese correo ya está registrado. Inicia sesión.");
      }

      if (data.session) {
        location.href = PAGINA_DESTINO;
      } else {
        mostrarMensaje("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.", "ok");
      }
    } else {
      const { error } = await db.auth.signInWithPassword({ email: correo, password: pass });
      if (error) return mostrarMensaje(traducirError(error));
      location.href = PAGINA_DESTINO;
    }
  } catch (err) {
    mostrarMensaje(traducirError(err));
  } finally {
    btnEnviar.disabled = false;
  }
});

btnRecuperar?.addEventListener("click", async () => {
  limpiarErrores();
  const correo = correoInput.value.trim().toLowerCase();

  if (!esEmailValido(correo)) {
    errorCorreo.hidden = false;
    mostrarMensaje("Escribe tu correo en el campo de arriba y vuelve a presionar.");
    return;
  }

  btnRecuperar.disabled = true;
  try {
    const { error } = await db.auth.resetPasswordForEmail(correo, {
      redirectTo: new URL("restablecer.html", location.href).href,
    });
    if (error) return mostrarMensaje(traducirError(error));
    mostrarMensaje("Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña.", "ok");
  } catch (err) {
    mostrarMensaje(traducirError(err));
  } finally {
    btnRecuperar.disabled = false;
  }
});

tabs[0].addEventListener("click", () => setModo("iniciar-sesion"));
tabs[1].addEventListener("click", () => setModo("registro"));

setModo(
  sessionStorage.getItem("seleccionado") === "Iniciar sesion" ? "iniciar-sesion" : "registro",
);

db.auth.getSession().then(({ data }) => {
  if (data.session) location.href = PAGINA_DESTINO;
});