# Projekt-PSW

Wypożyczalnia Samochodowa - Michał Ryduchowski

## Projekt

Celem projektu jest stworzenie aplikacji, która będzie korzystała z protokołów, stosowanych w technologiach webowych.

## Informacje

### Informacje ogólne

- Aplikacja może być stworzona w dowolnej technologii, która nie generuje kodu programu, rozwiązującego elementy projektu (np. frameworki generujące kod CRUD).
- Pod uwagę, przy ocenianiu, zostanie wzięta rozbudowa, zaawansowanie, prezentacja i obrona projektu oraz przydatność użytych narzędzi.
- Projekt musi być wykonany samodzielnie.

### Temat projektu

- Temat projektu jest dowolny, ale nie może się powtarzać w tych samych grupach.
- Temat projektu, należy zgłosić prowadzącemu na zajęciach lub poprzez mail – obowiązuje zasada "kto pierwszy ten lepszy".
- Obszary tematów do projektu: gry, mini portale społecznościowe, symulatory (np. logistyka, transport, smart home, urządzenia medyczne, sensory) itp.

- Wybrany temat: Wypożyczalnia samochodowa

### Repozytorium

- Projekt musi zostać umieszczony w zdalnym, prywatnym repozytorium gitlab (instrukcja), albo github (instrukcja).
- github jest zalecany, jeżeli chcesz zrobić ambitny projekt, który warto pokazać "światu".
- Każda nowo dodana funkcjonalność, powinna zostać natychmiastowo zamieszczona w repozytorium, w przeciwnym razie wiarygodność samodzielnej pracy będzie niska oraz projekt nie zostanie sprawdzony.

### Prezentacja i obrona

- Po zakończeniu prac, projekt musi zostać zaprezentowany i obroniony.
- Obrona może składać się z pytań odnośnie sposobu rozwiązania, znajomości użytych technologii i modyfikacji kodu projektu.
- Nieobronienie projektu może spowodować, że wiarygodność samodzielnej pracy będzie niska, co może skutkować obniżeniem oceny (nawet do oceny negatywnej).

## Kryteria oceniania

### HTTP (6 pkt.)

- Możliwość wykonywania operacji CRUD na różnych danych zgodnie ze wzorcem RESTful:
    - dodawanie danych (CREATE) (0,13 pkt. za każdy, max. 0,5 pkt);
    - odczytywanie danych (READ) (0,13 pkt. za każdy, max. 0,5 pkt);
    - zmiana danych (UPDATE) (0,13 pkt. za każdy, max. 0,5 pkt);
    - usuwanie danych (DELETE) (0,13 pkt. za każdy, max. 0,5 pkt).
    - przykładowo CRUD danych osobowych, komentarzy, zmiana ruchów gry itp.
- Możliwość wyszukania danych wg wzorca (zgodnie ze wzorcem RESTful) (0,25 pkt. bez wzorca, 0,5 pkt. wg wzorca).
    - przykładowy wzorzec: es, powinien znaleźć słowo piesek (w słowie zawiera się podsłowo es).
- Możliwość logowania (wysyłanie danych logowania zgodnie ze wzorcem RESTful) (0,5 pkt.).
- Stworzenie klienta, dzięki któremu użytkownik będzie mógł obsługiwać punkty końcowe serwera (max. 3 pkt. w zależności od sposobu wykonania, różnorodności i liczby punktów końcowych).

### MQTT, WebSocket (6 pkt.)

- Utworzenie funkcjonalności z wykorzystaniem backendowego protokołu MQTT (0,1-1 pkt za każdą różną w zależności od stopnia zaawansowania, max. 3 pkt.).
- Utworzenie funkcjonalności z wykorzystaniem frontendowego protokołu WebSocket (0,1-1 pkt za każdą różną w zależności od stopnia zaawansowania, max. 3 pkt.).
    - w przypadku użycia WebSocket jako warstwy transportowej dla MQTT, punkty będą liczone, tylko za jeden protokół

### Inne (6 pkt.)

- Dodatkowa funkcjonalność (za każdą różną 0-2 pkt. w zależność od stopnia zaawansowania, max. 6 pkt., przy czym łączna punktacja za rzeczy niepowiązane z protokołami nie będzie przekraczała 3 pkt.).
    - Przykładowe inne funkcjonalności, powiązane z protokołami:
        - wykorzystanie innych protokołów, np. SSH, SSE, TCP, SRP (dokumentacja).
        - sensowne wykorzystanie ciasteczek (plików cookie).
        - utworzenie i wykorzystanie certyfikatu TLS.
        - możliwość korzystania z pokoi (konfiguracja przy pomocy protokołu).
        - konfiguracja protokołów backendowych tak, aby można było z nich korzystać po stronie frontendowej (konfiguracja brokera, instrukcja użycia).
        - konfiguracja i wdrożenie aplikacji na serwer NGINX (lub innym serwerze proxy dla HTTP).
        - możliwość korzystania z tej samej funkcjonalności przy pomocy dwóch (lub więcej) różnych protokołów np. możliwość korzystania z czatu przy pomocy samego HTTP i samego MQTT.
    - Przykładowe inne funkcjonalności:
        - zapisywane logów do pliku.
        - wykorzystanie bazy danych.
        - szyfrowanie haseł przechowywanych w bazie danych.
        - role użytkowników (administratorzy, moderatorzy, użytkownicy, goście) oraz sensowne uprawnienia ról.
        - w przypadku połączenia projektu z innym przedmiotem tj. Frontend developement, punktacja za każdą inną rzecz niezwiązaną z protokołami będzie dwa razy mniejsza

### Aplikacja (2 pkt.)

- Sposób wykonania i stopień zaawansowania aplikacji (max. 2 pkt.).
    - Aplikacja działa bez błędów.
    - możliwe ujemne punkty za wykryte błędy.