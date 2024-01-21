let jugador1 = [];
let jugador2 = [];
let torn = 1;  // 1 para jugador1, 2 para jugador2

fetch('personatges.json')
    .then(response => response.json())
    .then(data => {
        data = data.sort(() => Math.random() - 0.5);
        jugador1 = data.slice(0, 5);
        jugador2 = data.slice(5, 10);
        renderitzaCartes('jugador1', jugador1);
        renderitzaCartes('jugador2', jugador2);
    })
    .catch(error => console.error('Error al cargar el archivo JSON:', error));

function renderitzaCartes(jugadorId, cartes) {
    const jugadorElement = document.getElementById(jugadorId);
    const cartaTemplate = document.getElementById('carta-template');

    cartes.forEach(carta => {
        const cartaElement = cartaTemplate.content.cloneNode(true);

        // Configurar contenido dinámico de la carta
        cartaElement.querySelector('h3').textContent = carta.nom;
        cartaElement.querySelector('img').src = carta.img;
        cartaElement.querySelector('img').alt = carta.nom;
        cartaElement.querySelectorAll('.atributs p')[0].innerHTML = `<strong>Atac:</strong> ${carta.atac}`;
        cartaElement.querySelectorAll('.atributs p')[1].innerHTML = `<strong>Defensa:</strong> ${carta.defensa}`;
        cartaElement.querySelectorAll('.atributs p')[2].innerHTML = `<strong>Velocitat:</strong> ${carta.velocitat}`;
        cartaElement.querySelectorAll('.atributs p')[3].innerHTML = `<strong>Salut:</strong> <span class="salud">${carta.salut}</span>`; // Utilizar un span para la salud

        // Añade el evento de clic al elemento 'carta'
        cartaElement.querySelector('.carta').classList.add('no-seleccionada'); // Agregar la clase no-seleccionada
        cartaElement.querySelector('.carta').onclick = () => seleccionaCarta(jugadorId, carta);
        jugadorElement.appendChild(cartaElement);
    });
}

function seleccionaCarta(jugadorId, carta) {
    const jugadorElement = document.getElementById(jugadorId);
    const cartas = jugadorElement.getElementsByClassName('carta');

    // Remover la clase 'seleccionada' de todas las cartas
    Array.from(cartas).forEach(cartaElement => {
        cartaElement.classList.remove('seleccionada');
    });

    // Encontrar la carta seleccionada y agregar la clase 'seleccionada'
    const cartaSeleccionada = Array.from(cartas).find(cartaElement => {
        return cartaElement.getElementsByTagName('h3')[0].innerText === carta.nom;
    });

    if (cartaSeleccionada) {
        cartaSeleccionada.classList.add('seleccionada');
        cartaSeleccionada.classList.remove('no-seleccionada'); // Quitar la clase no-seleccionada
    }
}

function iniciaCombat() {
    const cartaJugador1 = getCartaSeleccionada('jugador1');
    const cartaJugador2 = getCartaSeleccionada('jugador2');
    if (cartaJugador1 && cartaJugador2) {
        combat(cartaJugador1, cartaJugador2);
    } else {
        mostrarMensaje('Cada jugador debe seleccionar una carta antes de iniciar el combate.');
    }
}

function getCartaSeleccionada(jugadorId) {
    const cartaSeleccionada = document.getElementById(jugadorId).getElementsByClassName('seleccionada')[0];
    if (cartaSeleccionada) {
        const nomCarta = cartaSeleccionada.getElementsByTagName('h3')[0].innerText;
        return jugadorId === 'jugador1' ? jugador1.find(carta => carta.nom === nomCarta) : jugador2.find(carta => carta.nom === nomCarta);
    }
    return null;
}

function combat(carta1, carta2) {
    const atacant = torn === 1 ? carta1 : carta2;
    const defensor = torn === 1 ? carta2 : carta1;

    const diferenciaAtacDefensa = atacant.atac - defensor.defensa;
    const puntsAtac = diferenciaAtacDefensa > 0 ? diferenciaAtacDefensa : 10;

    defensor.salut -= puntsAtac;

    const mensaje = `${atacant.nom} ataca a ${defensor.nom} y le daña ${puntsAtac} puntos.`;
    mostrarMensaje(mensaje);

    if (defensor.salut <= 0) {
        const mensajeGanador = `${defensor.nom} ha quedado sin salud. ${atacant.nom} gana!`;
        mostrarMensaje(mensajeGanador);
    } else {
        // Actualizar la salud en la carta después del combate
        setTimeout(() => {  
            actualizarVidaEnCarta(defensor);
            torn = torn === 1 ? 2 : 1;
        }, 1000); // Retardo de 1 segundo (puedes ajustar según tus necesidades)

        // Mostrar mensaje de salud después de actualizar la carta
        const mensajeSalud = `${defensor.nom} tiene ${defensor.salut} puntos de salud restantes.`;
        mostrarMensaje(mensajeSalud);
    }
}


function actualizarVidaEnCarta(carta) {
    // Obtener el elemento de la salud de la carta seleccionada
    const jugadorId = torn === 1 ? 'jugador1' : 'jugador2';
    const cartaElement = document.querySelector(`#${jugadorId} .carta.seleccionada`);

    if (cartaElement) {
        // Obtener el elemento de la salud dentro de la carta
        const saludElement = cartaElement.querySelector('.salud');

        if (saludElement) {
            // Actualizar el valor visual en la carta
            saludElement.textContent = carta.salut;

            // Agregar un mensaje de vida actualizada dentro de la carta
            const mensajeVida = document.createElement('p');
            mensajeVida.textContent = `Vida actualizada: ${carta.salut}`;
            cartaElement.appendChild(mensajeVida);

            // Remover el mensaje después de unos segundos (puedes ajustar según tus necesidades)
            setTimeout(() => {
                cartaElement.removeChild(mensajeVida);
            }, 2000);
        } else {
            console.error('Elemento de salud no encontrado en la carta seleccionada.');
        }
    } else {
        console.error('Carta seleccionada no encontrada.');
    }
}



function reiniciaJoc() {
    torn = 1;
    jugador1 = [];
    jugador2 = [];
    document.getElementById('jugador1').innerHTML = '';
    document.getElementById('jugador2').innerHTML = '';
    fetch('personatges.json')
        .then(response => response.json())
        .then(data => {
            data = data.sort(() => Math.random() - 0.5);
            jugador1 = data.slice(0, 5);
            jugador2 = data.slice(5, 10);
            renderitzaCartes('jugador1', jugador1);
            renderitzaCartes('jugador2', jugador2);
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
}

function mostrarMensaje(mensaje) {
    // Obtiene el elemento HTML de los mensajes
    const mensajesElemento = document.getElementById('mensajes');
    
    // Agrega el nuevo mensaje al elemento, con un salto de línea
    mensajesElemento.innerText += mensaje + "\n";
}