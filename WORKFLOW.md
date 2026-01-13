# FIX Hub - Development Workflow Guide

Dieser Guide beschreibt den besten Workflow für die Entwicklung am FIX Hub Projekt.

## 📋 Inhaltsverzeichnis

1. [Setup](#1-setup-für-entwicklung)
2. [Parallel Entwickeln](#2-parallel-entwickeln)
3. [Code-Struktur](#3-code-struktur--workflow)
4. [Git Workflow](#4-git-workflow)
5. [Commits](#5-commit-format)
6. [Testing](#6-testing-strategie)
7. [Täglicher Ablauf](#7-täglicher-workflow)
8. [Debugging](#8-debugging)
9. [Probleme Lösen](#9-häufige-probleme)
10. [Checklist](#10-checklist-vor-push)

---

## 1. Setup für Entwicklung

### Initiales Setup (einmalig)

```bash
cd /home/am/Dokumente/develop/finclusion

# Backend Dependencies
mvn clean install -DskipTests

# Frontend Dependencies
cd ui
npm install
cd ..
```

### IDE Empfehlungen

**Backend:**
- IntelliJ IDEA Community Edition (kostenlos)
- VS Code mit Extension Pack for Java
- Öffne: `pom.xml` (Dependencies werden automatisch heruntergeladen)

**Frontend:**
- VS Code (empfohlen)
- WebStorm (kostenpflichtig)
- Öffne Ordner: `ui/`

---

## 2. Parallel Entwickeln

**Dies ist die Standard-Entwicklungs-Umgebung:**

### Terminal 1 - Backend (mit Auto-Reload)

```bash
cd /home/am/Dokumente/develop/finclusion
./start-backend.sh
# oder: mvn spring-boot:run
```

**Läuft auf:** http://localhost:8080
**Features:**
- Spring Boot DevTools aktiviert → Auto-Reload bei Code-Änderungen
- Actuator für Health Checks
- WebSocket Support

### Terminal 2 - Frontend (mit HMR - Hot Module Reload)

```bash
cd /home/am/Dokumente/develop/finclusion
./start-frontend.sh
# oder: cd ui && npm run dev
```

**Läuft auf:** http://localhost:5173
**Features:**
- Vite Dev Server mit extremem Fast Refresh
- Jede Änderung sofort im Browser sichtbar
- TypeScript Überprüfung in Echtzeit

### Terminal 3 - Git & Development

```bash
# Git Operationen ausführen
git status
git add .
git commit -m "feat: ..."
git push origin main
```

---

## 3. Code-Struktur & Workflow

### Backend (Spring Boot Java)

```
src/main/java/com/example/fixhub/
├── FixHubApplication.java          # Main Class - App Start
├── config/                          # Konfiguration
│   ├── HubConfig.java
│   ├── SecurityConfig.java          # Spring Security Settings
│   ├── WebSocketConfig.java         # WebSocket Endpoints
│   ├── RouteConfig.java
│   └── IncomingConfig.java
├── controller/                      # REST API Endpoints
│   ├── AuthController.java          # Login/Auth
│   └── ... weitere Controller
├── service/                         # Business Logic
│   ├── FixEngineService.java        # Hauptlogik
│   └── ... weitere Services
├── model/                          # Data Classes
│   ├── Connection.java
│   └── ... weitere Models
└── security/                       # Auth & Security
    └── ... security classes
```

**Entwicklung Backend:**

1. **Neue REST Endpoint hinzufügen:**
   ```java
   // In src/main/java/com/example/fixhub/controller/MyController.java
   @RestController
   @RequestMapping("/api/my")
   public class MyController {
       @GetMapping("/test")
       public ResponseEntity<String> test() {
           return ResponseEntity.ok("Hello");
       }
   }
   ```
   - Sofort erreichbar unter: http://localhost:8080/api/my/test
   - Kein Neustart nötig (DevTools)

2. **Neue Service Methode hinzufügen:**
   ```java
   @Service
   public class MyService {
       public void doSomething() {
           // Business Logic
       }
   }
   ```

3. **Database/Model hinzufügen:**
   ```java
   @Entity
   public class MyEntity {
       @Id
       private String id;
       private String name;
   }
   ```

### Frontend (React TypeScript)

```
ui/src/
├── main.tsx                    # Entry Point - React Start
├── App.tsx                     # Root Component
├── api.ts                      # Backend API Calls
├── styles.css                  # Global Styles
└── components/                 # React Komponenten
    ├── Login.tsx               # Login Screen
    ├── ConnectionForm.tsx      # Form für Connections
    ├── ConnectionsList.tsx     # Liste von Connections
    ├── MessageStream.tsx       # Message Viewer
    ├── RoutesList.tsx          # Routes anzeigen
    └── SessionsList.tsx        # Sessions anzeigen
```

**Entwicklung Frontend:**

1. **Neue Component erstellen:**
   ```tsx
   // ui/src/components/MyComponent.tsx
   export function MyComponent() {
       return <div>Hello Component</div>;
   }
   ```
   - Sofort im Browser sichtbar
   - Keine Refresh nötig

2. **Backend API aufrufen:**
   ```tsx
   import { api } from '../api';
   
   const response = await api.get('/api/my/test');
   console.log(response.data);
   ```

3. **State Management:**
   ```tsx
   const [count, setCount] = useState(0);
   
   return (
       <button onClick={() => setCount(count + 1)}>
           Count: {count}
       </button>
   );
   ```

---

## 4. Git Workflow

### Feature Branch Workflow (Empfohlen)

```bash
# 1. Feature Branch erstellen
git checkout -b feature/meine-neue-funktion

# 2. Code schreiben & testen
# ... entwickeln ...

# 3. Commits machen
git add .
git commit -m "feat: neue Funktion hinzufügen"

# 4. Vor Push: main aktualisieren
git checkout main
git pull origin main

# 5. Feature Branch auf main rebasen (optional aber sauberer)
git rebase main feature/meine-neue-funktion

# 6. Zurück zu Feature Branch
git checkout feature/meine-neue-funktion

# 7. Push zum Remote
git push origin feature/meine-neue-funktion

# 8. Merge zu main
git checkout main
git merge feature/meine-neue-funktion
git push origin main
```

### Einfacher Workflow (Schneller)

```bash
# Direkt auf main arbeiten
git pull origin main
# ... code ändern ...
git add .
git commit -m "feat: kleine Änderung"
git push origin main
```

### Git Status checken

```bash
# Übersicht
git status

# Letzten Commits anschauen
git log --oneline -10

# Branches anschauen
git branch -a

# Aktuelle Änderungen anschauen
git diff
```

---

## 5. Commit Format

### Gutes Commit Format (Konventionell)

```bash
# Feature (neue Funktion)
git commit -m "feat: Add login authentication"
git commit -m "feat: Add WebSocket support"

# Bugfix
git commit -m "fix: Fix null pointer exception"
git commit -m "fix: Fix CORS issue with frontend"

# Refactor (Code umgestalten, keine Funktionsänderung)
git commit -m "refactor: Simplify authentication logic"
git commit -m "refactor: Extract service methods"

# Dokumentation
git commit -m "docs: Add API documentation"
git commit -m "docs: Update README with setup instructions"

# Tests
git commit -m "test: Add unit tests for FixEngineService"

# Abhängigkeiten
git commit -m "chore: Update Spring Boot version"
git commit -m "chore: Add Lombok dependency"
```

### Schlechte Commits (Vermeiden!)

```bash
# ✗ Zu vague
git commit -m "fixed stuff"
git commit -m "changes"
git commit -m "update"

# ✗ Zu detailliert
git commit -m "fix a small bug in line 42 where i forgot a semicolon"

# ✗ Multiple Aufgaben in einem Commit
git commit -m "Add login, fix CORS, update docs"
```

### Commit Best Practices

- **Eine Sache pro Commit** - Macht Änderungen leicht nachverfolgbar
- **Aussagekräftige Nachrichten** - Zukünftiges Du wird es danken
- **Kleinere Commits** - Einfacher zu reviewen und zu reverteren
- **Häufige Commits** - Nicht erst 100 Änderungen auf einmal

---

## 6. Testing Strategie

### Backend Unit Tests

```bash
# Alle Tests laufen
mvn test

# Spezifischen Test laufen
mvn test -Dtest=FixEngineServiceTest

# Schneller: Tests überspringen
mvn clean package -DskipTests
```

**Test Datei schreiben:**
```java
// src/test/java/com/example/fixhub/service/FixEngineServiceTest.java
@SpringBootTest
class FixEngineServiceTest {
    @Test
    void testSomething() {
        assertEquals(expected, actual);
    }
}
```

### Frontend Tests

```bash
# Tests laufen (wenn Vitest konfiguriert)
cd ui && npm test

# E2E Tests manuell
# Öffne http://localhost:5173
# Teste alle Funktionen im Browser manuell
```

### Integration Testing

```bash
# Backend läuft
mvn spring-boot:run  # Terminal 1

# Frontend läuft
cd ui && npm run dev  # Terminal 2

# Im Browser testen
# http://localhost:5173
# - Login testen
# - Connections erstellen
# - Messages senden/empfangen
```

---

## 7. Täglicher Workflow

### Arbeitstag Start

```bash
# 1. Neuste Changes holen
git pull origin main

# 2. Backend Dependencies aktualisieren
mvn clean compile

# 3. Frontend Dependencies aktualisieren
cd ui && npm install && cd ..
```

### Während dem Tag

```bash
# Terminal 1: Backend
./start-backend.sh

# Terminal 2: Frontend
./start-frontend.sh

# Terminal 3: Editor
# Code schreiben, testen, commiten

# Periodisch:
git add .
git commit -m "feat: incremental progress"
git push origin main
```

### Arbeitstag Ende

```bash
# Alle Änderungen commiten
git add .
git commit -m "feat: daily progress"

# Zu GitHub pushen
git push origin main

# Status checken
git status  # Sollte: "nothing to commit, working tree clean"
git log --oneline -5  # Letzten Commits anschauen
```

---

## 8. Debugging

### Backend Debugging (IntelliJ)

1. Breakpoint setzen: Klick links von Zeilennummer
2. Run → Debug (statt Run)
3. Debugger startet automatisch
4. Variables anschauen, Step Through Code

### Backend Debugging (Maven)

```bash
mvn -Dmaven.surefire.debug test
# Debugger läuft auf Port 5005
```

### Frontend Debugging (Browser)

```bash
# F12 drücken → Developer Tools öffnet sich
# Sources Tab → Code anschauen
# Console Tab → console.log() sehen
# Network Tab → API Calls sehen

# Oder React DevTools Extension installieren
# https://chrome.google.com/webstore/...
```

### Schnelle Logs

```javascript
// Frontend - React
console.log('Value:', myVariable);
console.error('Error:', error);
console.table(arrayOfObjects);

// Backend - Java
logger.info("Value: " + myVariable);
logger.error("Error: ", exception);
System.out.println("Quick debug");  // Sofort sichtbar
```

---

## 9. Häufige Probleme

| Problem | Ursache | Lösung |
|---------|--------|--------|
| Port 8080 belegt | Andere App läuft drauf | `lsof -i :8080` dann `kill -9 <PID>` |
| Port 5173 belegt | Frontend läuft noch | Alte Terminal beenden oder anderen Port: `npm run dev -- --port 5174` |
| Dependencies alt | npm/maven Cache | `mvn dependency:resolve` oder `npm update` |
| Frontend lädt nicht | Browser Cache | Ctrl+Shift+Delete (Cache löschen) |
| Git Konflikt | Gleiche Datei von zwei Personen | `git merge main` und Konflikte manuell lösen |
| Build fehlgeschlagen | Syntax Fehler | Logs anschauen, Fehler beheben, nochmal builden |
| API antwortet nicht | Backend läuft nicht | `./start-backend.sh` in Terminal 1 |
| WebSocket Error | Connection Problem | Backend Logs checken, CORS Settings |

---

## 10. Checklist vor Push

```bash
# ☐ Code lokal getestet?
mvn test                      # Backend Tests
cd ui && npm run build       # Frontend Build

# ☐ Keine Debug-Logs im Code?
# ☐ Keine Credentials gepusht?  (check: keine Passwörter, Keys in .env)
# ☐ .env.example statt .env gepusht?

# ☐ Git Status sauber?
git status
# Sollte zeigen: "nothing to commit, working tree clean"

# ☐ Aussagekräftige Commit Messages?
git log --oneline -5

# ☐ Alle Commits gepusht?
git push origin main
git log origin/main --oneline -5
```

---

## Quick Commands

```bash
# Backend
./start-backend.sh              # Start mit Auto-Reload
mvn spring-boot:run            # Alternative
mvn test                        # Tests laufen
mvn clean package              # Build für Production

# Frontend
./start-frontend.sh            # Start Dev Server
cd ui && npm run dev           # Alternative
cd ui && npm run build         # Production Build
cd ui && npm run preview       # Preview Production Build

# Git
git status                      # Status
git add .                       # Alle Änderungen
git commit -m "..."            # Commit
git push origin main           # Push
git pull origin main           # Pull
git log --oneline -10         # History anschauen

# Utilities
git branch -a                   # Branches anschauen
git checkout -b feature/name   # Neuer Branch
git merge feature/name         # Branch mergen
lsof -i :8080                 # Port 8080 checken
```

---

## Weitere Ressourcen

- [Spring Boot Dokumentation](https://spring.io/projects/spring-boot)
- [React Dokumentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Workflow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [REST API Best Practices](https://restfulapi.net/)

---

**Viel Erfolg beim Entwickeln! 🚀**
