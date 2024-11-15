let anchoCanvas = 800;
let altoCanvas = 400;

let jugadorX = 15;
let jugadorY;
let anchoRaqueta = 10;
let altoRaqueta = 100;

let computadoraX = anchoCanvas - 25;
let computadoraY;

let pelotaX, pelotaY;
let diametroPelota = 20;
let velocidadPelotaX = 5;
let velocidadPelotaY = 5;
let anguloRotacion = 0;
let velocidadGiro = 0;

let grosorMarco = 10;

let jugadorScore = 0;
let computadoraScore = 0;
let puntosParaGanar = 10;
let juegoTerminado = false;
let jugadorGano = false;

// Variables para las imágenes
let imagenFondo;
let imagenRaquetaJugador;
let imagenRaquetaComputadora;
let imagenPelota;
let imagenFondoGanador;
let imagenFondoPerdedor;

// Variables para los sonidos
let sonidoBounce;
let sonidoGameOver;
let sonidoGol;
let narrador;  // Objeto para control de la narración de voz

function preload() {
    // Carga de las imágenes
    imagenFondo = loadImage('fondo1.png');
    imagenRaquetaJugador = loadImage('barra1.png');
    imagenRaquetaComputadora = loadImage('barra2.png');
    imagenPelota = loadImage('bola.png');
    imagenFondoGanador = loadImage('fondo_ganador.png');
    imagenFondoPerdedor = loadImage('fondo_perdedor.png');
  
    
    // Carga de los sonidos
    sonidoBounce = loadSound('bounce.wav');
    sonidoGameOver = loadSound('game_over.wav');
    sonidoGol = loadSound('gol.wav');

}

function setup() {
    createCanvas(anchoCanvas, altoCanvas);
    jugadorY = height / 2 - altoRaqueta / 2;
    computadoraY = height / 2 - altoRaqueta / 2;
    resetPelota();

    // Ajustar volumen de los efectos de sonido
    sonidoBounce.setVolume(0.3);
    sonidoGameOver.setVolume(0.3);
    sonidoGol.setVolume(0.3);

}

function draw() {
    if (juegoTerminado) {
        mostrarPantallaFinal();
    } else {
        // Dibuja la imagen de fondo
        image(imagenFondo, 0, 0, anchoCanvas, altoCanvas);

        dibujarMarcos();
        dibujarRaquetas();
        dibujarPelota();
        mostrarPuntaje();
        moverPelota();
        moverComputadora();
        verificarColisiones();
    }
}

function dibujarMarcos() {
    fill("#2B3FD6");
    rect(0, 0, width, grosorMarco); // Marco superior
    rect(0, height - grosorMarco, width, grosorMarco); // Marco inferior
}

function dibujarRaquetas() {
    image(imagenRaquetaJugador, jugadorX, jugadorY, anchoRaqueta, altoRaqueta);
    image(imagenRaquetaComputadora, computadoraX, computadoraY, anchoRaqueta, altoRaqueta);
}

function dibujarPelota() {
    let velocidadTotal = sqrt(velocidadPelotaX ** 2 + velocidadPelotaY ** 2);
    velocidadGiro = velocidadTotal * 0.1;
    anguloRotacion += velocidadGiro;
    
    push();
    translate(pelotaX, pelotaY);
    rotate(anguloRotacion);
    imageMode(CENTER);
    image(imagenPelota, 0, 0, diametroPelota, diametroPelota);
    pop();
}

function mostrarPuntaje() {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill("#D63C2B");
    text(jugadorScore, width / 4, grosorMarco * 3);
    text(computadoraScore, 3 * width / 4, grosorMarco * 3);
}

function moverPelota() {
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;

    if (pelotaY - diametroPelota / 2 < grosorMarco || 
        pelotaY + diametroPelota / 2 > height - grosorMarco) {
        velocidadPelotaY *= -1;
    }
}

function moverComputadora() {
    if (pelotaY > computadoraY + altoRaqueta / 2) {
        computadoraY += 2;
    } else if (pelotaY < computadoraY + altoRaqueta / 2) {
        computadoraY -= 2;
    }
    computadoraY = constrain(computadoraY, grosorMarco, height - grosorMarco - altoRaqueta);
}

function verificarColisiones() {
    if (pelotaX - diametroPelota / 2 < jugadorX + anchoRaqueta && 
        pelotaY > jugadorY && pelotaY < jugadorY + altoRaqueta) {
        velocidadPelotaX *= -1;
        sonidoBounce.play();
    }

    if (pelotaX + diametroPelota / 2 > computadoraX && 
        pelotaY > computadoraY && pelotaY < computadoraY + altoRaqueta) {
        velocidadPelotaX *= -1;
        sonidoBounce.play();
    }

    if (pelotaX < 0) {
        computadoraScore++;
        sonidoGol.play();
        narrarPuntaje();
        resetPelota();
    } else if (pelotaX > width) {
        jugadorScore++;
        sonidoGol.play();
        narrarPuntaje();
        resetPelota();
    }

    if (jugadorScore >= puntosParaGanar || computadoraScore >= puntosParaGanar) {
        juegoTerminado = true;
        jugadorGano = jugadorScore > computadoraScore;
        narrarResultadoFinal();
    }
}

function narrarPuntaje() {
    if (narrador) {
        window.speechSynthesis.cancel();
    }

    
    let mensaje = `${jugadorScore} a ${computadoraScore}`;
    narrador = new SpeechSynthesisUtterance(mensaje);

    // Cambiar a español latino
    narrador.lang = "es-AR"; // Puedes probar otros acentos latinos como "es-AR" o "es-CO"
    let vocesDisponibles = window.speechSynthesis.getVoices();
    let vozLatino = vocesDisponibles.find(v => 
        v.lang.includes("es-") && 
        (v.lang === "es-MX" || v.lang === "es-AR" || v.lang === "es-CO" || v.lang === "es-US")
    );

    if (vozLatino) {
        narrador.voice = vozLatino;
    }

    narrador.rate = 1;
    window.speechSynthesis.speak(narrador);
}
function narrarResultadoFinal() {
    if (narrador) {
        window.speechSynthesis.cancel();
    }

    let mensaje = jugadorGano ? "¡Felicitaciones! Ganaste la partida." : "Lo siento, perdiste contra la computadora.";
    narrador = new SpeechSynthesisUtterance(mensaje);

    // Cambiar a español latino
    narrador.lang = "es-AR"; // Puedes probar otros acentos latinos como "es-AR" o "es-CO"
    let vocesDisponibles = window.speechSynthesis.getVoices();
    let vozLatino = vocesDisponibles.find(v => 
        v.lang.includes("es-") && 
        (v.lang === "es-MX" || v.lang === "es-AR" || v.lang === "es-CO" || v.lang === "es-US")
    );

    if (vozLatino) {
        narrador.voice = vozLatino;
    }

    narrador.rate = 1;
    window.speechSynthesis.speak(narrador);
}
function resetPelota() {
    pelotaX = width / 2;
    pelotaY = height / 2;
    velocidadPelotaX = 5 * (Math.random() > 0.5 ? 1 : -1);
    velocidadPelotaY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function mostrarPantallaFinal() {
    if (jugadorGano) {
        image(imagenFondoGanador, 0, 0, anchoCanvas, altoCanvas);
    } else {
        image(imagenFondoPerdedor, 0, 0, anchoCanvas, altoCanvas);
    }

    textSize(48);
    fill("#FFFFFF");
    textAlign(CENTER, CENTER);
    text(jugadorGano ? "¡Ganaste!" : "¡Perdiste!", width / 2, height / 2);
    textSize(24);
    text("Presiona cualquier tecla para reiniciar", width / 2, height / 2 + 50);
}

function keyPressed() {
    if (juegoTerminado) {
        juegoTerminado = false;
        jugadorScore = 0;
        computadoraScore = 0;
        resetPelota();
    } else {
        if (keyCode === UP_ARROW) {
            jugadorY -= 50;
        } else if (keyCode === DOWN_ARROW) {
            jugadorY += 50;
        }
        jugadorY = constrain(jugadorY, grosorMarco, height - grosorMarco - altoRaqueta);
    }
}
