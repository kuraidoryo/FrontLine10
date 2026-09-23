# FrontLine10

[Polska wersja poniżej](#wersja-polska)

FrontLine10 is a fast-paced tactical board game for two players. Each player commands ten numbered pawns and a hidden flag on a 10×10 battlefield.

Instead of moving pieces one by one, players program one move during a short preparation phase. Both moves are then resolved simultaneously, creating situations where prediction, bluffing, positioning and timing are more important than simply having the strongest piece.

---

## Game Overview

The game is played on a 10×10 board divided between two opposing sides:

- **Player 1** starts at the bottom of the board and moves upwards.
- **Player 2** starts at the top of the board and moves downwards.
- Each player controls:
  - one flag,
  - ten pawns,
  - pawn values from 1 to 10.

The main objective is to capture the opponent's flag while protecting your own.

The game supports:

- local player-versus-player matches,
- games against the computer,
- online matches using PeerJS.

---

## Main Menu

The main menu provides the following options:

### Local Game

The local game menu contains:

- **1 VS 1** — two players play on the same device,
- **PLAY WITH COMPUTER** — Player 1 plays against the built-in AI,
- **BACK** — returns to the main menu.

### Online Game

Online mode allows two players to connect through a room ID:

- one player creates a room as the host,
- the second player joins using the host's room ID,
- the host controls the authoritative game state.

---

## Board and Starting Areas

The battlefield contains 100 cells arranged in a 10×10 grid.

Each player has a deployment area consisting of the first two rows on their side:

- Player 1 may deploy pieces on cells `80–99`,
- Player 2 may deploy pieces on cells `0–19`.

The flag has an additional restriction:

- Player 1's flag must be placed in the last row, cells `90–99`,
- Player 2's flag must be placed in the first row, cells `0–9`.

The flag cannot be placed in the second deployment row.

---

## Setup Phase

Each player completes the following setup:

1. Place one flag.
2. Place ten pawns.
3. Confirm the setup.
4. Assign values from 1 to 10 to the pawns.
5. Confirm the values.

A player cannot finish setup until:

- a flag has been placed,
- all ten pawns have been deployed,
- every pawn has received a unique value.

The values are hidden from the opponent at the beginning of the game. A pawn's value is revealed when it participates in combat.

### Pawn Values

Each player has exactly one pawn with each value:

```text
1 2 3 4 5 6 7 8 9 10
```

The values may be assigned freely to the player's pawns.

During the value assignment phase, values can be selected using:

- the buttons displayed in the sidebar,
- keyboard keys `1` to `9`,
- the `0` key for value `10`.

---

## Turn Structure

After both players finish setup, the game enters the main game phase.

Each round follows this sequence:

1. Player 1 selects a pawn and chooses a destination.
2. Player 2 selects a pawn and chooses a destination.
3. Both moves are resolved simultaneously.
4. Combat and captures are processed.
5. A new round begins.

In local games, each player has up to **10 seconds** to choose a move.

If a player does not choose a move before the timer expires, that player performs no move for the round.

The game does not immediately reveal a player's move to the opponent in local play. Both planned moves are resolved only after the two players have made their decisions or their timers have expired.

---

## Movement Rules

Pawns move according to their player's direction:

- Player 1 moves toward smaller row numbers.
- Player 2 moves toward larger row numbers.

### Forward Movement

A pawn may normally move to one of the following cells in the next row:

- diagonally forward-left,
- directly forward,
- diagonally forward-right.

A destination cannot contain one of the player's own pawns or the player's own flag.

If at least one forward destination is available, the pawn may only move forward.

### Horizontal Movement

If no forward move is available, the pawn may move horizontally:

- one cell to the left, or
- one cell to the right.

Horizontal movement is only available when all possible forward destinations are blocked.

Pawns cannot move backwards.

---

## Simultaneous Resolution

Both selected moves are evaluated as part of the same game event.

The game handles several special cases.

### Two Pawns Move Into the Same Cell

If both pawns select the same destination:

- the pawn with the higher value survives,
- the lower-value pawn is removed,
- if both values are equal, both pawns are removed.

### Two Pawns Swap Positions

If Player 1 moves to Player 2's starting cell while Player 2 moves to Player 1's starting cell:

- the two pawns fight,
- the higher-value pawn survives on its destination side,
- equal values remove both pawns.

### Only One Pawn Moves Into an Occupied Cell

If a pawn moves into a cell occupied by an opponent's pawn:

- the values are compared,
- the stronger pawn survives,
- a tie removes both pawns.

If the defending pawn wins, its value is revealed.

### Moving Onto an Own Piece

The user interface normally prevents selecting a destination occupied by one of the player's own pieces. The game resolution system also treats a move onto an own piece as replacing the destination with the moving pawn.

---

## Combat System

Combat is based on the values assigned during setup.

Normally:

```text
Higher value defeats lower value.
```

There is one special rule:

```text
1 defeats 10.
```

This creates a circular relationship between the weakest and strongest values:

```text
1 > 10 > 9 > 8 > ... > 2
```

Examples:

- `8` defeats `5`,
- `10` defeats `4`,
- `1` defeats `10`,
- `6` and `6` destroy each other.

Pawn values are hidden until the pawn is revealed through combat.

---

## Capturing the Flag

A player wins immediately when one of their pawns moves onto the opponent's flag.

The attacking pawn remains on the flag's cell and its value is revealed.

### Simultaneous Flag Capture

If both players capture each other's flags during the same round:

- both flags are removed,
- the game ends in a draw.

This rule prevents the game from giving priority to one player when both successful attacks happen simultaneously.

---

## End Conditions

The game can end in three ways:

### Player Victory

A player captures the opponent's flag.

### Draw

Both players capture each other's flags during the same round.

### Disconnection

In online mode, disconnecting from the opponent causes the game to display an opponent-disconnected message.

---

## Playing Against the Computer

The computer opponent is available through the **PLAY WITH COMPUTER** option.

The AI:

- automatically places its flag,
- deploys ten pawns,
- assigns values from 10 down to 1,
- calculates possible moves,
- considers hidden pawn values,
- simulates possible future positions,
- selects a move using Information Set Monte Carlo Tree Search.

The AI combines:

- random simulations,
- hidden-information determinization,
- UCB1 move selection,
- board evaluation heuristics.

The evaluation considers:

- the number of remaining pawns,
- the total value of remaining pawns,
- the distance to the opponent's flag,
- the protection of its own flag.

The AI searches for up to approximately 1.5 seconds or 4,000 simulations per move.

---

## Online Multiplayer

Online games use PeerJS for peer-to-peer communication.

### Hosting a Game

1. Select **ONLINE GAME**.
2. Enter `host` when prompted.
3. Copy the generated room ID.
4. Send the room ID to the other player.
5. Wait for the opponent to connect.

The host plays as Player 1.

### Joining a Game

1. Select **ONLINE GAME**.
2. Enter `join` when prompted.
3. Enter the host's room ID.
4. Click **CONNECT**.

The joining player plays as Player 2.

### Online Synchronization

The online mode sends messages for:

- player setup,
- selected moves,
- board state updates,
- turn changes.

The host acts as the authoritative side of the match and broadcasts the resolved board state to the guest.

Hidden pawn values are censored when sent to the opponent. A player can see their own values, while unknown enemy values remain hidden until revealed by combat.

---

## User Interface

The game interface contains:

- a 10×10 board,
- a sidebar with current instructions,
- the current piece or flag indicator,
- the number of remaining pawns during setup,
- value-selection buttons,
- game status messages,
- the move timer,
- the `DONE!` confirmation button.

During the game phase:

- selecting a pawn highlights it,
- legal movement destinations are highlighted in green,
- the selected move is stored until the round is resolved,
- combat results are displayed in the status panel.

Player 1 pieces are blue and Player 2 pieces are red.

---

## Project Structure

```text
FrontLine10/
├── index.html              # Main menu
├── menu.css                # Main menu styling
├── menu.js                 # Menu navigation and game mode selection
├── gameFiles/
│   ├── index.html          # Game board and game interface
│   ├── script.js           # Main game logic and rules
│   ├── ai.js               # Computer opponent and AI search
│   ├── online.js           # PeerJS online multiplayer logic
│   └── style.css           # Game board and interface styling
├── flagImages/
│   ├── flagBlue.png        # Player 1 flag
│   └── flagRed.png         # Player 2 flag
├── piecesImages/
│   ├── circleBlue.png      # Player 1 pawn
│   └── circleRed.png       # Player 2 pawn
└── utilsImages/
    └── logo.png            # Game logo
```

---

## Running the Game

FrontLine10 is a static web application and does not require a build system or package installation.

The simplest option is to open `index.html` in a web browser. For the most reliable experience, run the project through a local HTTP server.

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Node.js

If a static server is available, for example `serve`:

```bash
npx serve .
```

The game uses PeerJS from the following external CDN:

```text
https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js
```

An internet connection is required for online multiplayer and for loading PeerJS.

---

## Technology

- HTML5
- CSS3
- JavaScript
- PeerJS
- Browser DOM APIs
- Information Set Monte Carlo Tree Search for the AI

---

## Project Status

FrontLine10 is a browser-based tactical board game prototype with:

- local multiplayer,
- computer-controlled matches,
- online peer-to-peer multiplayer,
- hidden pawn values,
- simultaneous turn resolution,
- flag-capture victory conditions.

---

<a name="wersja-polska"></a>
# FrontLine10

FrontLine10 to szybka, taktyczna gra planszowa dla dwóch graczy. Każdy gracz dowodzi dziesięcioma pionkami o ukrytych wartościach oraz jedną ukrytą flagą na planszy 10×10.

Zamiast wykonywać ruchy po kolei, gracze programują po jednym ruchu w krótkiej fazie decyzyjnej. Następnie oba ruchy są rozpatrywane jednocześnie. Dzięki temu najważniejsze są przewidywanie ruchów przeciwnika, blef, odpowiednie rozmieszczenie pionków i dobre wykorzystanie ich wartości.

---

## Opis gry

Rozgrywka odbywa się na planszy składającej się ze 100 pól.

- **Gracz 1** rozpoczyna na dole planszy i porusza się w górę.
- **Gracz 2** rozpoczyna na górze planszy i porusza się w dół.
- Każdy gracz posiada:
  - jedną flagę,
  - dziesięć pionków,
  - wartości pionków od 1 do 10.

Głównym celem gry jest zdobycie flagi przeciwnika przy jednoczesnej ochronie własnej flagi.

Gra oferuje:

- lokalną rozgrywkę dwóch osób,
- rozgrywkę z komputerem,
- tryb online wykorzystujący PeerJS.

---

## Menu główne

### Gra lokalna

Menu gry lokalnej zawiera:

- **1 VS 1** — dwóch graczy gra na tym samym urządzeniu,
- **PLAY WITH COMPUTER** — Gracz 1 gra przeciwko komputerowi,
- **BACK** — powrót do głównego menu.

### Gra online

Tryb online umożliwia połączenie dwóch graczy za pomocą identyfikatora pokoju:

- jeden gracz tworzy pokój jako host,
- drugi gracz dołącza przy użyciu identyfikatora hosta,
- host kontroluje główny stan rozgrywki.

---

## Plansza i strefy początkowe

Plansza ma rozmiar 10×10 pól.

Każdy gracz posiada strefę początkową obejmującą dwa rzędy po jego stronie:

- Gracz 1 może rozstawiać elementy na polach `80–99`,
- Gracz 2 może rozstawiać elementy na polach `0–19`.

Flaga ma dodatkowe ograniczenie:

- flaga Gracza 1 musi znajdować się w ostatnim rzędzie, na polach `90–99`,
- flaga Gracza 2 musi znajdować się w pierwszym rzędzie, na polach `0–9`.

Flagi nie można umieścić w drugim rzędzie strefy początkowej.

---

## Faza rozstawiania

Każdy gracz wykonuje następujące czynności:

1. Umieszcza jedną flagę.
2. Umieszcza dziesięć pionków.
3. Zatwierdza rozstawienie.
4. Przypisuje pionkom wartości od 1 do 10.
5. Zatwierdza przypisane wartości.

Nie można zakończyć fazy rozstawiania, dopóki:

- flaga nie zostanie umieszczona,
- wszystkie dziesięć pionków nie znajdzie się na planszy,
- każdy pionek nie otrzyma unikalnej wartości.

Wartości pionków są ukryte przed przeciwnikiem. Zostają ujawnione dopiero wtedy, gdy dany pionek bierze udział w walce.

### Wartości pionków

Każdy gracz posiada dokładnie po jednym pionku o każdej wartości:

```text
1 2 3 4 5 6 7 8 9 10
```

Rozmieszczenie wartości można wybrać samodzielnie.

Podczas przypisywania wartości można korzystać z:

- przycisków widocznych w panelu bocznym,
- klawiszy `1`–`9`,
- klawisza `0`, który oznacza wartość `10`.

---

## Przebieg tury

Po zakończeniu rozstawiania przez obu graczy rozpoczyna się główna faza gry.

Każda runda przebiega następująco:

1. Gracz 1 wybiera pionek i jego miejsce docelowe.
2. Gracz 2 wybiera pionek i jego miejsce docelowe.
3. Oba ruchy są rozpatrywane jednocześnie.
4. Rozstrzygane są walki i zdobycia.
5. Rozpoczyna się kolejna runda.

W lokalnym trybie gry każdy gracz ma maksymalnie **10 sekund** na wybranie ruchu.

Jeśli gracz nie wybierze ruchu przed upływem czasu, w danej rundzie nie wykona żadnego ruchu.

Ruch nie jest natychmiast wykonywany po jego wybraniu. Gra czeka na decyzję drugiego gracza, a następnie rozpatruje oba ruchy jako jedno zdarzenie.

---

## Zasady poruszania się

Pionki poruszają się w kierunku przeciwnika:

- Gracz 1 porusza się w kierunku mniejszych numerów wierszy,
- Gracz 2 porusza się w kierunku większych numerów wierszy.

### Ruch do przodu

W normalnej sytuacji pionek może poruszyć się na jedno z trzech pól w następnym rzędzie:

- po skosie do przodu w lewo,
- prosto do przodu,
- po skosie do przodu w prawo.

Pole docelowe nie może zawierać własnego pionka ani własnej flagi.

Jeżeli dostępne jest przynajmniej jedno pole do przodu, pionek może poruszać się wyłącznie do przodu.

### Ruch poziomy

Jeżeli żadne pole do przodu nie jest dostępne, pionek może poruszyć się poziomo:

- o jedno pole w lewo,
- albo o jedno pole w prawo.

Ruch poziomy jest możliwy wyłącznie wtedy, gdy wszystkie dostępne ruchy do przodu są zablokowane.

Pionki nie mogą poruszać się do tyłu.

---

## Jednoczesne rozpatrywanie ruchów

Ruchy obu graczy są analizowane w ramach tej samej fazy rozstrzygnięcia.

Gra obsługuje kilka specjalnych sytuacji.

### Dwa pionki wchodzą na to samo pole

Jeżeli oba pionki wybiorą to samo pole:

- wygrywa pionek o wyższej wartości,
- pionek o niższej wartości zostaje usunięty,
- przy remisie oba pionki zostają usunięte.

### Zamiana pozycji przez dwa pionki

Jeżeli Gracz 1 wchodzi na pole, z którego ruszył pionek Gracza 2, a Gracz 2 wchodzi na pole, z którego ruszył pionek Gracza 1:

- pionki walczą,
- silniejszy pionek pozostaje na planszy,
- w przypadku remisu oba pionki zostają usunięte.

### Jeden pionek wchodzi na zajęte pole

Jeżeli pionek wchodzi na pole zajęte przez pionek przeciwnika:

- wartości pionków zostają porównane,
- silniejszy pionek pozostaje na planszy,
- przy remisie oba pionki znikają.

Jeżeli broniący się pionek wygra, jego wartość zostaje ujawniona.

### Ruch na własny element

Interfejs gry nie pozwala normalnie wybrać pola zajętego przez własny pionek lub flagę. Mechanizm rozstrzygania ruchów posiada jednak obsługę takiej sytuacji i traktuje ją jako zastąpienie elementu na polu docelowym przez poruszający się pionek.

---

## System walki

Walka opiera się na wartościach przypisanych pionkom podczas rozstawiania.

Standardowa zasada brzmi:

```text
Wyższa wartość pokonuje niższą wartość.
```

Obowiązuje jednak specjalna reguła:

```text
1 pokonuje 10.
```

Tworzy to cykliczną zależność:

```text
1 > 10 > 9 > 8 > ... > 2
```

Przykłady:

- `8` pokonuje `5`,
- `10` pokonuje `4`,
- `1` pokonuje `10`,
- `6` kontra `6` powoduje usunięcie obu pionków.

Wartości pionków są ukryte do momentu ich ujawnienia w wyniku walki.

---

## Zdobywanie flagi

Gracz natychmiast wygrywa, gdy jeden z jego pionków wejdzie na pole z flagą przeciwnika.

Pionek zdobywający flagę pozostaje na jej polu, a jego wartość zostaje ujawniona.

### Jednoczesne zdobycie flag

Jeżeli podczas tej samej rundy obaj gracze zdobędą swoje wzajemne flagi:

- obie flagi zostają usunięte,
- gra kończy się remisem.

Dzięki temu żaden z graczy nie otrzymuje pierwszeństwa w sytuacji, gdy oba zwycięskie ruchy nastąpiły jednocześnie.

---

## Warunki zakończenia gry

Gra może zakończyć się na trzy sposoby.

### Zwycięstwo gracza

Gracz zdobywa flagę przeciwnika.

### Remis

Obaj gracze zdobywają swoje flagi w tej samej rundzie.

### Rozłączenie

W trybie online rozłączenie przeciwnika powoduje wyświetlenie komunikatu o utracie połączenia.

---

## Gra przeciwko komputerowi

Opcja **PLAY WITH COMPUTER** uruchamia mecz przeciwko komputerowi.

Komputer:

- automatycznie umieszcza swoją flagę,
- rozmieszcza dziesięć pionków,
- przypisuje im wartości od 10 do 1,
- analizuje możliwe ruchy,
- uwzględnia ukryte wartości pionków,
- symuluje przyszłe pozycje,
- wybiera ruch za pomocą algorytmu Information Set Monte Carlo Tree Search.

AI wykorzystuje:

- losowe symulacje,
- odtwarzanie możliwych układów ukrytych wartości,
- wybór UCB1,
- heurystyczną ocenę pozycji.

Podczas oceny pozycji komputer bierze pod uwagę:

- liczbę pozostałych pionków,
- sumę wartości pozostałych pionków,
- odległość pionków od flagi przeciwnika,
- ochronę własnej flagi.

Komputer analizuje pozycję przez maksymalnie około 1,5 sekundy lub do wykonania 4000 symulacji.

---

## Tryb online

Tryb online korzysta z PeerJS i połączenia peer-to-peer.

### Tworzenie gry

1. Wybierz **ONLINE GAME**.
2. Wpisz `host`.
3. Skopiuj wygenerowany identyfikator pokoju.
4. Przekaż identyfikator drugiemu graczowi.
5. Poczekaj na jego połączenie.

Host gra jako Gracz 1.

### Dołączanie do gry

1. Wybierz **ONLINE GAME**.
2. Wpisz `join`.
3. Wprowadź identyfikator pokoju hosta.
4. Kliknij **CONNECT**.

Dołączający gracz gra jako Gracz 2.

### Synchronizacja online

Tryb online przesyła między graczami informacje o:

- rozstawieniu elementów,
- wybranych ruchach,
- stanie planszy,
- zmianach tury.

Host pełni rolę strony autorytatywnej i przesyła gościowi rozstrzygnięty stan planszy.

Ukryte wartości pionków są cenzurowane podczas przesyłania danych:

- gracz widzi własne wartości,
- wartości pionków przeciwnika pozostają ukryte,
- wartość przeciwnika zostaje ujawniona dopiero po walce.

---

## Interfejs użytkownika

Interfejs gry zawiera:

- planszę 10×10,
- panel boczny z instrukcjami,
- ikonę aktualnego elementu,
- licznik pozostałych pionków podczas rozstawiania,
- przyciski wyboru wartości,
- komunikaty dotyczące stanu gry,
- licznik czasu,
- przycisk `DONE!`.

W głównej fazie gry:

- kliknięcie pionka zaznacza go,
- prawidłowe pola docelowe są podświetlane na zielono,
- wybrany ruch jest zapamiętywany do momentu rozstrzygnięcia rundy,
- wynik walki jest wyświetlany w panelu stanu gry.

Pionki Gracza 1 są niebieskie, a pionki Gracza 2 czerwone.

---

## Struktura projektu

```text
FrontLine10/
├── index.html              # Główne menu
├── menu.css                # Styl głównego menu
├── menu.js                 # Nawigacja menu i wybór trybu gry
├── gameFiles/
│   ├── index.html          # Plansza i interfejs gry
│   ├── script.js           # Główna logika gry i zasady
│   ├── ai.js               # Komputerowy przeciwnik i algorytm AI
│   ├── online.js           # Logika trybu online PeerJS
│   └── style.css           # Style planszy i interfejsu
├── flagImages/
│   ├── flagBlue.png        # Flaga Gracza 1
│   └── flagRed.png         # Flaga Gracza 2
├── piecesImages/
│   ├── circleBlue.png      # Pionek Gracza 1
│   └── circleRed.png       # Pionek Gracza 2
└── utilsImages/
    └── logo.png            # Logo gry
```

---

## Uruchamianie gry

FrontLine10 jest statyczną aplikacją internetową i nie wymaga systemu budowania ani instalowania zależności.

Najprościej otworzyć plik `index.html` w przeglądarce. Zalecane jest jednak uruchomienie projektu przez lokalny serwer HTTP.

### Python

```bash
python -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000
```

### Node.js

Jeśli masz dostępny prosty serwer statyczny, na przykład `serve`:

```bash
npx serve .
```

Gra ładuje PeerJS z zewnętrznego CDN:

```text
https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js
```

Do działania trybu online oraz pobrania biblioteki PeerJS wymagane jest połączenie z internetem.

---

## Technologie

- HTML5
- CSS3
- JavaScript
- PeerJS
- Browser DOM API
- Information Set Monte Carlo Tree Search dla przeciwnika AI

---

## Status projektu

FrontLine10 jest przeglądarkową wersją taktycznej gry planszowej oferującą:

- lokalną rozgrywkę wieloosobową,
- mecze przeciwko komputerowi,
- rozgrywkę online peer-to-peer,
- ukryte wartości pionków,
- jednoczesne rozpatrywanie ruchów,
- zwycięstwo poprzez zdobycie flagi przeciwnika.