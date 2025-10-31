# Code Archaeology Game

discover ancient code fragments from different programming eras and learn how computer programming evolved over time.

## How to Play

1. **Dig for Artifacts**
2. **Answer Questions**
3. **Learn History**
4. **Unlock Eras**
5. **Build Your Museum**

## Programming Eras

- **FORTRAN (1957)**
- **C (1972)**
- **Python (1991)**

## Stack

Built with vanilla HTML, CSS, and JavaScript.

i made this cause i love the history of computer science and how it evolved from so level language to such high level language like python so i thought let's create a game based on this. 

the hardest parts of building this game were implementing the minesweeper algorithm from scratch (learning Fisher-Yates shuffle, grid coordinate logic, and ensuring safe first clicks), managing complex game state across multiple systems (eras, fragments, quizzes, achievements) without bugs where modals duplicated or state reset unexpectedly, and understanding async/await for loading JSON data files with promises. 

the Web Audio API was completely new - creating sounds with oscillators instead of audio files - and dynamic DOM manipulation for programmatic modal creation, proper event listener cleanup, and z-index management took lots of debugging. localStorage for persistence taught me JSON serialization and data structure design. This project pushed me way beyond my comfort zone, especially debugging interactions between different game systems and tracking state across 2000+ lines of code.

it was quite tough but i keep on learning and commenting writing the code in proper industry standard way and learning all the way.

Simply open `index.html` in your web browser(to run it locally after forking it :)) 

---
built by GargiPandeyy

[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)
