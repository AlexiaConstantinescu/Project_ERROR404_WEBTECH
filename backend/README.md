## Instalare și Rulare

### 1. Instalare dependente
```bash
npm install
```

### 2. Configurare PostgreSQL

Creeaza baza de date:
```sql
CREATE DATABASE notite_studenti;
CREATE USER notite_user WITH PASSWORD 'parola123';
GRANT ALL PRIVILEGES ON DATABASE notite_studenti TO notite_user;
```

### 3. Configurare .env

Creeaza fisier `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notite_studenti
DB_USER=notite_user
DB_PASSWORD=parola123
JWT_SECRET=secret_key_foarte_lung_si_sigur_12345
```

### 4. Pornire server
```bash
# Development
npm run dev

# Production
npm start
```

Server disponibil pe: `http://localhost:3000`

## API Endpoints

### Autentificare
- `POST /api/auth/register` - Inregistrare
- `POST /api/auth/login` - Login

### Notite (necesita autentificare)
- `GET /api/notes` - Lista notite
- `POST /api/notes` - Creare notita
- `GET /api/notes/:id` - Detalii notita
- `PUT /api/notes/:id` - Editare notita
- `DELETE /api/notes/:id` - Stergere notita

### Materii
- `GET /api/subjects` - Lista materii
- `POST /api/subjects` - Creare materie

### Tag-uri
- `GET /api/tags` - Lista tag-uri
- `POST /api/tags` - Creare tag

### Grupuri
- `GET /api/groups` - Lista grupuri
- `POST /api/groups` - Creare grup

## Exemplu Utilizare

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@stud.ase.ro","password":"password123"}'
```

Raspuns:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Creare notita
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Notiță test","content":"Conținut..."}'
```

### 3. Obtinere notite
```bash
curl http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```
