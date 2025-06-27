---
title: "Cómo creé mi primera librería en PIP"
description: "Experiencia paso a paso creando una librería Python y publicándola en PyPI, con ejemplos de uso reales."
pubDate: 2023-04-04
tags: ["python", "pip", "librerías", "automatización", "educación"]
heroImage: "/assets/images/blog/mi-primera-libreria-pip/portada.webp"
---

La primera vez que vi a mi jefe ejecutar comandos en una terminal Linux, quedé totalmente inspirado. Acostumbrado a usar Windows toda la vida, me sorprendió que en esa terminal lo que le decías al computador, se cumplía **al pie de la letra**. Es decir, si escribías que querías borrar todos los archivos… ¡los borraba! Incluso si eso implicaba que luego no pudieras volver a encender la máquina.

Aún uso Windows cada día y lo considero un sistema operativo genial. Pero la realidad es que Windows “protege” al usuario de muchas acciones. Esta protección es buena en la mayoría de los casos, pero de alguna manera hace que tengas **menos poder** sobre tu PC.

Uno de los comandos que mi jefe escribió varias veces fue `pip install ...`. Me dijo que era para instalar paquetes de Python. En ese momento, no sabía ni qué era Python, y mucho menos qué era `pip`, pero la frase quedó grabada en mi mente.

La realidad es que no necesitas tener Linux para usar `pip`; funciona perfectamente en Windows o Mac. Pero como yo lo conocí en ese contexto, me quedó asociado a esa experiencia. Soy ingeniero civil de profesión, pero he aprendido programación por mi cuenta. Creo sinceramente que la programación es una herramienta poderosísima que debería enseñarse desde la educación básica, al igual que las matemáticas. Al menos nociones básicas sobre estructuras de datos, cómo funciona Internet, servidores, API’s, etc.

Como dicen por ahí, *todo parece imposible hasta que se hace*. Con esa idea, hace unos días me propuse crear mi primer proyecto `pip`.

---

## 🚀 Ventajas de tener un proyecto PIP

Decidí crear una librería `pip` por una razón fundamental: tengo varios programas en Python que uso frecuentemente en distintos proyectos, y necesito poder **importarlos fácilmente** sin copiar el código en cada uno. Mi objetivo es que cada carpeta de proyecto sea "aislable", es decir, que incluya solo lo esencial.

Subir una librería a [PyPI](https://pypi.org/) te permite:

- Evitar repetición de código.
- Actualizar la librería y tener los cambios reflejados en todos tus proyectos.
- Compartir tu código con la comunidad.

---

## 💼 Programa `conversor_nominas_bancos_chile`

El proyecto que seleccioné es sencillo pero muy útil para la empresa donde trabajo. Toma una nómina de pagos en Excel y la transforma al formato de otros bancos. Una nómina de pagos es simplemente un listado de transferencias para pagar a varias personas al mismo tiempo.

A pesar de su simplicidad, esta librería puede ser de gran ayuda para cualquier empresa que realice pagos de forma automatizada. Además, cuenta con una interfaz desarrollada en Tkinter, lo que facilita su uso para personas sin conocimientos de programación.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1680576506635/c3c1b1f6-0f31-4055-bd95-aebc3755e5f4.png)

---

## ⚙️ Proceso de creación de la librería

1. Crear estructura básica del proyecto:

```plaintext
nombre_del_proyecto/
|-- nombre_del_proyecto/
|   |-- __init__.py
|   |-- archivo1.py
|   |-- archivo2.py
|-- README.md
|-- LICENSE
|-- setup.py
```

2. Agregar el código a `archivo1.py` y `archivo2.py`.
3. Crear `README.md` con la documentación.
4. Agregar una licencia (`LICENSE`).
5. Configurar `setup.py` con metadatos del proyecto:

```python
from setuptools import setup, find_packages

setup(
    name='nombre_del_proyecto',
    version='0.1',
    author='Tu Nombre',
    author_email='tu_email@ejemplo.com',
    description='Descripción del proyecto',
    packages=find_packages(),
    install_requires=['paquete1', 'paquete2'],
)
```

6. Para ejecutar la interfaz desde la terminal tras instalar la librería, se puede usar:

```python
entry_points={
    'console_scripts': [
        'start_menu_conversor_nominas = conversor_nominas_bancos_chile.bank_tkinter_menu:iniciar_menu'
    ]
},
```

7. Para subirlo inicialmente, usé:

```bash
python setup.py sdist bdist_wheel
twine upload dist/*
```

Pero me encontré con este [artículo](https://blog.ganssle.io/articles/2021/10/setup-py-deprecated.html) que indica que **ya no se recomienda usar `setup.py` directamente**.

Así que opté por `poetry` y configuré `pyproject.toml` así:

```toml
[tool.poetry]
name = "conversor_nominas_bancos_chile"
version = "1.8.2"
description = "Librería que convierte nóminas del BCI al formato de otros bancos."
authors = ["Antonio Canada Momblant <xxxx@gmail.com>"]
license = "MIT"
readme = "README.md"
repository = "https://github.com/tonicanada/conversor_nominas_bancos_chile"

[tool.poetry.dependencies]
python = "^3.10"
pandas = "^1.5.3"
numpy = "^1.24.2"
datetime = "^5.1"
pathlib = "^1.0.1"
tk = "^0.1.0"
openpyxl = "^3.1.2"
xlrd = "^2.0.1"

[tool.poetry.scripts]
start_menu_conversor_nominas = "conversor_nominas_bancos_chile.bank_tkinter_menu:iniciar_menu"

[build-system]
requires = ["poetry>=1.0"]
build-backend = "poetry.masonry.api"
```

Finalmente lo subí con:

```bash
poetry build
poetry publish
```

---

## 📦 Instalación y ejemplo de uso

```bash
pip install conversor_nominas_bancos_chile
```

Y para abrir la interfaz:

```bash
start_menu_conversor_nominas
```

También puedes importar y usar las funciones directamente:

```python
from conversor_nominas_bancos_chile import bank_functions

# Convertir nómina BCI a distintos formatos bancarios
df_banco_chile = bank_functions.bci_to_bancochile_nomina_transferencias(...)
df_banco_santander = bank_functions.bci_to_santander_transferenciasmasivas(...)
```

Y acceder a archivos internos del paquete:

```python
from pathlib import Path
import json
import pkg_resources

path = pkg_resources.resource_filename('conversor_nominas_bancos_chile', 'bancos_codigos.json')
with open(path) as f:
    bancos_codigos = json.load(f)
```

---

## 🔗 Recursos

- [Repositorio en GitHub](https://github.com/tonicanada/conversor_nominas_bancos_chile)
- [PyPI del proyecto](https://pypi.org/project/conversor-nominas-bancos-chile/)

Si te gustó este artículo, ¡dale a 👏 y compártelo! Puedes seguirme en mi [LinkedIn](https://www.linkedin.com/in/canadamomblant/), [Twitter](https://twitter.com/toni_canada), [Facebook](https://www.facebook.com/toni.canada) o [Medium](https://tonicanada.medium.com/).
