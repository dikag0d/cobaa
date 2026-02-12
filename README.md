# 🐳 Docker + GitHub Codespaces Demo

Project demo untuk belajar menggunakan **Docker** di **GitHub Codespaces** lengkap dengan automated testing via **GitHub Actions**.

## 📁 Struktur Project

```
cobaa/
├── app.js                 # Express API server
├── test.js                # Automated test suite
├── package.json           # Node.js dependencies
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose (app + test)
├── .dockerignore
├── .gitignore
├── .devcontainer/
│   └── devcontainer.json  # GitHub Codespaces config
└── .github/
    └── workflows/
        └── docker-test.yml # CI/CD pipeline
```

## 🚀 Cara Pakai

### Option 1: Buka di GitHub Codespaces

1. Push repo ini ke GitHub
2. Buka repository di GitHub
3. Klik tombol **`<> Code`** → **`Codespaces`** → **`Create codespace on main`**
4. Tunggu environment siap (Docker sudah otomatis tersedia!)
5. Di terminal Codespaces, jalankan:

```bash
# Build & run
docker compose up --build

# Buka tab baru, test
docker compose --profile test run --rm test
```

### Option 2: Run Lokal (butuh Docker terinstall)

```bash
# Clone repo
git clone https://github.com/USERNAME/cobaa.git
cd cobaa

# Build & run app
docker compose up --build -d

# Jalankan test
docker compose --profile test run --rm test

# Stop
docker compose down
```

### Option 3: Tanpa Docker (Node.js langsung)

```bash
npm install
npm start          # Start server di port 3000
# Buka terminal baru:
npm test           # Jalankan test suite
```

## 🧪 Testing

### Manual Test (curl)

```bash
# Health check
curl http://localhost:3000/health

# Info endpoint
curl http://localhost:3000/info

# Echo endpoint
curl -X POST http://localhost:3000/echo \
  -H "Content-Type: application/json" \
  -d '{"hello": "docker"}'
```

### Automated Test via Docker Compose

```bash
# Ini akan build app, tunggu healthy, lalu jalankan test suite
docker compose --profile test run --rm test
```

### Automated Test via GitHub Actions

Setiap kali kamu **push** atau buat **Pull Request**, GitHub Actions akan otomatis:
1. ✅ Build Docker image
2. ✅ Start container & tunggu healthy
3. ✅ Jalankan test suite
4. ✅ Cleanup

Cek hasilnya di tab **Actions** di repository GitHub kamu.

## 📋 API Endpoints

| Method | Path     | Deskripsi                    |
|--------|----------|------------------------------|
| GET    | `/`      | Info tentang API             |
| GET    | `/health`| Health check (untuk Docker)  |
| GET    | `/info`  | System info (Node, memory)   |
| POST   | `/echo`  | Echo back request body       |

## 🔧 Setup GitHub Repository

```bash
# Init git repo
git init
git add .
git commit -m "🐳 Initial: Docker + Codespaces demo"

# Push ke GitHub
git remote add origin https://github.com/USERNAME/cobaa.git
git branch -M main
git push -u origin main
```

> **Note:** Ganti `USERNAME` dengan username GitHub kamu.

## 📖 Cara Kerja

```
┌─────────────────────────────────────────────┐
│  GitHub Codespaces                          │
│  ┌───────────────────────────────────────┐  │
│  │  devcontainer (Node.js 20)            │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Docker-in-Docker               │  │  │
│  │  │  ┌───────────┐  ┌───────────┐   │  │  │
│  │  │  │  web:3000  │  │   test    │   │  │  │
│  │  │  │  (app.js)  │→ │ (test.js) │   │  │  │
│  │  │  └───────────┘  └───────────┘   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  GitHub Actions (CI/CD)                     │
│  push/PR → build image → run → test → ✅    │
└─────────────────────────────────────────────┘
```
