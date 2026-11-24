function elemento(etiqueta, texto, clase) {
  const nodo = document.createElement(etiqueta);
  if (texto) nodo.textContent = texto;
  if (clase) nodo.className = clase;
  return nodo;
}

function rutaWeb(valor, permitirRutaLocal = false) {
  if (!valor) return "";
  try {
    const url = permitirRutaLocal ? new URL(valor, document.baseURI) : new URL(valor);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    if (permitirRutaLocal && url.protocol === "file:" && location.protocol === "file:") return url.href;
  } catch {
    return "";
  }
  return "";
}

function agregarEnlace(destino, texto, href) {
  if (!href) return;
  const enlace = elemento("a", texto, "button");
  enlace.href = href;
  destino.append(enlace);
}

function ficha(datos, clase) {
  const tarjeta = elemento("article", "", clase);
  const imagenes = [...(Array.isArray(datos.capturas) ? datos.capturas : []), datos.imagen].filter(Boolean);
  for (const valor of imagenes) {
    const imagen = rutaWeb(valor, true);
    if (!imagen) continue;
    const foto = elemento("img");
    foto.src = imagen;
    foto.alt = datos.imagenAlt || datos.nombre;
    foto.loading = "lazy";
    tarjeta.append(foto);
  }
  const meta = [datos.fecha, datos.estado].filter(Boolean).join(" · ");
  if (meta) tarjeta.append(elemento("p", meta, "meta"));
  tarjeta.append(elemento("h3", datos.nombre));
  for (const [campo, etiqueta] of [["objetivo", "Objetivo"], ["participacion", "Mi participación"], ["herramientas", "Herramientas"], ["resultado", "Resultado"]]) {
    if (!datos[campo]) continue;
    const parrafo = elemento("p");
    parrafo.append(elemento("strong", etiqueta + ". "), datos[campo]);
    tarjeta.append(parrafo);
  }
  agregarEnlace(tarjeta, "Ver sitio web", rutaWeb(datos.sitioWeb));
  agregarEnlace(tarjeta, "Ver demostración", rutaWeb(datos.demostracion, true));
  agregarEnlace(tarjeta, "Ver repositorio", rutaWeb(datos.repositorio));
  return tarjeta;
}

const menu = document.getElementById("menu-principal");
const botonMenu = document.querySelector(".menu-toggle");
if (menu && botonMenu) {
  const esMovil = () => window.matchMedia("(max-width: 680px)").matches;
  const cerrarMenu = (devolverFoco) => {
    menu.classList.remove("is-open");
    menu.inert = esMovil();
    menu.setAttribute("aria-hidden", String(esMovil()));
    botonMenu.setAttribute("aria-expanded", "false");
    botonMenu.setAttribute("aria-label", "Abrir menú");
    if (devolverFoco) botonMenu.focus();
  };
  const sincronizarMenu = () => {
    if (esMovil()) {
      cerrarMenu(false);
    } else {
      menu.classList.remove("is-open");
      menu.inert = false;
      menu.setAttribute("aria-hidden", "false");
      botonMenu.setAttribute("aria-expanded", "false");
      botonMenu.setAttribute("aria-label", "Abrir menú");
    }
  };

  document.body.classList.add("js-ready");
  sincronizarMenu();
  botonMenu.addEventListener("click", () => {
    if (botonMenu.getAttribute("aria-expanded") === "true") {
      cerrarMenu(true);
    } else {
      menu.inert = false;
      menu.setAttribute("aria-hidden", "false");
      menu.classList.add("is-open");
      botonMenu.setAttribute("aria-expanded", "true");
      botonMenu.setAttribute("aria-label", "Cerrar menú");
    }
  });
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a") && esMovil()) cerrarMenu(true);
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && botonMenu.getAttribute("aria-expanded") === "true") cerrarMenu(true);
  });
  window.addEventListener("resize", sincronizarMenu);
}

if (typeof portafolio !== "undefined") {
  for (const [id, clase] of [["proyectos", "project"], ["tareas", "task"]]) {
    const seccion = document.getElementById(id);
    if (seccion && Array.isArray(portafolio[id])) {
      seccion.append(...portafolio[id].map((datos) => ficha(datos, clase)));
    }
  }
}
