// Clase que representa una carta en el juego
class Carta {
  constructor(tipo, cartasPuntos = 10) {
    this.tipo = tipo;
    this.cartasPuntos = cartasPuntos;
    this.img = getCardImage(tipo);
  }

  //*Tipos Carta
  static tipos = ["bomba", "desactivador", "saltar_turno", "cartas_puntos"];
}

// Clase que representa a un jugador
class Jugador {
  constructor(nombre, turno = false, eliminado = false) {
    this.nombre = nombre;
    this.cartas = [];
    this.eliminado = eliminado;
    this.turno = turno;
  }

  // Añade una carta a la mano del jugador
  addCarta(carta) {
    this.cartas.push(carta);
  }

  // Cuenta el número de cartas en la mano del jugador
  contarCartas() {
    return this.cartas.length;
  }

  // Calcula la suma de puntos de las cartas
  suma = () =>
    this.cartas.reduce((total, carta) => total + carta.cartasPuntos, 0);

  // Cuenta el número de cartas de tipo "saltar_turno".
  numSaltarTurno = () =>
    this.cartas.filter((carta) => carta.tipo === "saltar_turno").length;

  // Cuenta el número de cartas desactivadoras
  numCartasDesactivar = () =>
    this.cartas.filter((carta) => carta.tipo === "desactivador").length;

  // Elimina una carta de la mano del jugador
  eliminarCarta(index) {
    this.cartas.splice(index, 1);
  }

  // Roba una carta del mazo y la añade a la mano del jugador
  robarCarta(mazo) {
    const carta = mazo.robarCarta();
    this.addCarta(carta);
    return carta;
  }
}

// Clase que representa el mazo de cartas
class Deck {
  constructor() {
    this.cartas = [];
    this.cartasDescartadas = [];
  }

  // Inicializa el mazo con las cartas del juego
  init() {
    this.cartas = [];
    const cantidades = [6, 6, 10, 38]; // * 60 cartas
    Carta.tipos.forEach((tipo, index) => {
      for (let i = 0; i < cantidades[index]; i++) {
        this.cartas.push(new Carta(tipo));
      }
    });
    this.mezclar();
  }

  // Roba una carta del mazo
  robarCarta() {
    if (this.cartas.length === 0) {
      this.cartas = [...this.cartasDescartadas];
      this.cartasDescartadas = [];
      this.mezclar();
    }
    return this.cartas.pop();
  }

  // Mezcla las cartas del mazo
  mezclar() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }
}


// Para obtener la imagen de una carta según su tipo
function getCardImage(tipo) {
  switch (tipo) {
    case "bomba":
      return "./img/bomba/bomba.png";
    case "desactivador":
      return "./img/herramienta/herramienta.png";
    case "saltar_turno":
      return "./img/pasarTurno/pasarTurno.png";
    case "cartas_puntos":
      let random = Math.floor(Math.random() * 20) + 1;
      return random < 10
        ? `./img/card/robot_0${random}.png`
        : `./img/card/robot_${random}.png`;
    default:
      return "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const mazo = new Deck();
  mazo.init();

  const jugadores = [
    new Jugador("Jugador 1"),
    new Jugador("Jugador 2"),
    new Jugador("Jugador 3"),
  ];
  let jugadorActual = jugadores[0];

  const btnRobar = document.getElementById("btnRobar");
  btnRobar.addEventListener("click", manejarRobarCarta);

  const btnPasar = document.getElementById("btnPasar");
  btnPasar.addEventListener("click", pasarTurno);
  btnPasar.style.display = "none";

  // Para manejar cuando un jugador roba una carta bomba
  function manejarCartaBomba(jugador) {
    if (jugador.numCartasDesactivar() > 0) {
      jugador.eliminarCarta(
        jugador.cartas.findIndex((c) => c.tipo === "desactivador")
      );
      alert("¡Bomba desactivada!");
    } else {
      eliminarJugador(jugador);
    }
  }

   // Para actualizar la lista de cartas descartadas
  function actualizarListaDescartes() {
    const listaDescarte = document.getElementById("listaDescarte");
    listaDescarte.innerHTML = "";

    mazo.cartasDescartadas.forEach((carta, index) => {
      const li = document.createElement("li");
      li.textContent = `Carta ${index + 1}: ${carta.tipo}`;
      listaDescarte.appendChild(li);
    });
  }

   // Para eliminar a un jugador del juego
  function eliminarJugador(jugador) {
    jugador.eliminado = true;

    mazo.cartasDescartadas.push(...jugador.cartas);
    jugador.cartas = [];

    alert(
      `${jugador.nombre} ha sido eliminado y sus cartas han sido descartadas.`
    );

    actualizarListaDescartes(); // Actualizar la lista de descartes en el HTML
    pasarTurno();
  }

  // Para manejar cuando un jugador roba una carta
  function manejarRobarCarta() {
    if (mazo.cartas.length > 0) {
      const cartaRobada = jugadorActual.robarCarta(mazo);
      mostrarCartaRobada(cartaRobada);

      switch (cartaRobada.tipo) {
        case "bomba":
          manejarCartaBomba(jugadorActual);
          break;
        case "saltar_turno":
          manejarCartaSaltarTurno();
          break;
        default:
          btnPasar.style.display = "none";
      }

      actualizarInterfaz();

      // Pasar el turno automáticamente, si no sale carta de saltar turno
      if (cartaRobada.tipo !== "saltar_turno") {
        setTimeout(() => {
          pasarTurno();
        }, 1000);
      }
    } else {
      alert("No quedan cartas en el mazo");
    }
  }

  // Pasar el turno al siguiente jugador
  function pasarTurno() {
    let currentIndex = jugadores.indexOf(jugadorActual);
    let nextIndex = (currentIndex + 1) % jugadores.length;

    let jugadoresActivos = jugadores.filter((j) => !j.eliminado);

    if (jugadoresActivos.length === 1) {
      alert(`¡${jugadoresActivos[0].nombre} ha ganado el juego!`);
      return;
    }

    while (jugadores[nextIndex].eliminado) {
      nextIndex = (nextIndex + 1) % jugadores.length;
    }

    jugadorActual = jugadores[nextIndex];
    btnPasar.style.display = "none";
    actualizarInterfaz();
  }

  function manejarCartaSaltarTurno() {
    btnPasar.style.display = "inline";
    btnPasar.onclick = function () {
      btnPasar.style.display = "none";
      pasarTurno();
    };
  }

  // Actualizar Interfaz del juego
  function actualizarInterfaz() {
    jugadores.forEach((jugador, index) => {
      document.getElementById(
        `J${index + 1}NumCartas`
      ).textContent = `⚪️ Número de cartas: ${jugador.contarCartas()}`;
      document.getElementById(
        `J${index + 1}Puntos`
      ).textContent = `⚪️ Puntos totales: ${jugador.suma()}`;
      document.getElementById(
        `J${index + 1}saltoTurno`
      ).textContent = `⚪️ Cartas salto turno: ${jugador.numSaltarTurno()}`;
      document.getElementById(
        `J${index + 1}Desactivacion`
      ).textContent = `⚪️ Cartas desactivación: ${jugador.numCartasDesactivar()}`;
    });
  }

  // Mostrar la carta robada en la interfaz
  function mostrarCartaRobada(carta) {
    const imgCartaRobada = document.getElementById("imgCartaRobada");
    imgCartaRobada.src = carta.img;
  }

  actualizarInterfaz();
});
