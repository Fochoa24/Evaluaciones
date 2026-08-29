/**
 * Carrusel de servicios en la página de inicio.
 * Muestra 3 tarjetas en escritorio, 2 en tablet y 1 en móvil.
 */
(function iniciarCarrusel() {
    const pista = document.getElementById("beneficios");
    const btnPrev = document.getElementById("carrusel-prev");
    const btnNext = document.getElementById("carrusel-next");
    const indicadores = document.getElementById("carrusel-indicadores");

    if (!pista || !btnPrev || !btnNext || !indicadores) {
        return;
    }

    const articulos = Array.from(pista.children);
    let indice = 0;

    function tarjetasVisibles() {
        if (window.innerWidth <= 700) {
            return 1;
        }

        if (window.innerWidth <= 1024) {
            return 2;
        }

        return 3;
    }

    function obtenerPaso() {
        const primero = articulos[0];
        const estilos = window.getComputedStyle(pista);
        const gap = Number.parseFloat(estilos.gap) || 0;

        return primero.getBoundingClientRect().width + gap;
    }

    function maxIndice() {
        return Math.max(0, articulos.length - tarjetasVisibles());
    }

    function irA(nuevoIndice) {
        const maximo = maxIndice();
        indice = ((nuevoIndice % (maximo + 1)) + (maximo + 1)) % (maximo + 1);
        pista.style.transform = "translateX(-" + (indice * obtenerPaso()) + "px)";
        actualizarIndicadores();
    }

    function crearIndicadores() {
        indicadores.innerHTML = "";
        const total = maxIndice() + 1;

        for (let i = 0; i < total; i += 1) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "indicador";
            boton.setAttribute("aria-label", "Ir al grupo " + (i + 1));
            boton.addEventListener("click", function () {
                irA(i);
            });
            indicadores.appendChild(boton);
        }
    }

    function actualizarIndicadores() {
        const puntos = indicadores.querySelectorAll(".indicador");
        puntos.forEach(function (punto, i) {
            punto.classList.toggle("activo", i === indice);
        });
    }

    btnPrev.addEventListener("click", function () {
        irA(indice - 1);
    });

    btnNext.addEventListener("click", function () {
        irA(indice + 1);
    });

    window.addEventListener("resize", function () {
        crearIndicadores();
        irA(Math.min(indice, maxIndice()));
    });

    crearIndicadores();
    irA(0);
})();
