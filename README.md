# Rekrutacja PWr in Space

**Zadanie 3 - Aplikacja Kontroli Misji**

## Jak uruchomić apliakcję?

1. Sklonuj repozytorium lub pobierz plik .zip i go wypakuj
2. Otwórz folder rezpozytorium w terminalu
3. Zbuduj i uruchom kontenery dockera za pomocą polecenia:
```docker compose up --build```
4. Po poprawnym uruchomienu serwera w przeglądarce internetowej należy wpisać:
```127.0.0.1:5001``` lub ```localhost:5001``` 
aby wejść do aplikacji

## Co potrafi system?

* Komunikacja między dwoma użytkownikami z wykorzystanie WebSocket.
* Wczytywanie starszych wiadomości z bazy danych.
* Prezentacja danych za pomocą tekstu (np. Tętno: 120) oraz historia zmian za pomocą wykresu (ostatnie 15 odczytów).
* Kontrola sesji - zabezpieczenie przed podwójnym logowaniem na tego samego użytkownika.

## Wykorzystane technologie

* **Backend:** Python3, Flask, Flask-SocketIO
* **Baza danych:** SQLite3
* **Frontend:** HTML5, CSS3, JavaScript
* **Wizualizacja danych:** Chart.js
* **Koneteryzacja:** Docker