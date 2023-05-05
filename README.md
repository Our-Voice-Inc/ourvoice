# 🔊 Ourvoice

<b>Monorepo for OurVoice System </b>

A safe space for employees and community members to anonymously discuss issues and concerns about their work environments.

## 📖 Documentation

> TBD

## 🐱‍💻 Installation & Development

### Installation

> TBD

### Development

#### Suggested IDEA and plugins:

- [VSCode](https://code.visualstudio.com/)
- [Restore Terminals](https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals) (to spawn VSCode integrated terminals and run commands on startup)

#### Prerequisites:

In order to achieve local development frontend cookie sharing for subdomains you need to modify local host file (`C:\Windows\system32\drivers\etc` on Windows and `/etc/hosts` on Unix) and add following

```bash
127.0.0.1 portal.ourvoice.test
127.0.0.1 app.ourvoice.test
127.0.0.1 auth.ourvoice.test
127.0.0.1 api.ourvoice.test
127.0.0.1 authapi.ourvoice.test
127.0.0.1 admin.ourvoice.test
127.0.0.1 demo.ourvoice.test
```

This also links to the nginx `reverse-proxy` deployed via `docker-compose` file. If you add any additional app subdomains you also need to add redirection and modify `nginx` proxy configuration in [/deployment/init/nginx](/deployment/init/nginx).

> NOTE: This is only needed for local development, production will have its own reverse proxy installed and domains are handled with DNS records.

#### Setup:

- Run from deployment `docker compose up -d` to start services (`reverse-proxy`, `supertokens`, `databases`)
- Run from the root `pnpm install` to install dependencies (also runs `pnpm postinstall` and copies all `.env` files)
- Run from the root `pnpm generate:api:all` and `pnpm migrate:api:all` for database setup.
- Run `pnpm dev:apps` to start all applications in development mode
  > NOTE: if you get any Prisma errors then run the generate and migrate scrips one by one.

Navigate to `http://demo.ourvoice.test/` to access the Ourvoice App

> NOTE: to be able to login without password and use email sending functions from the APIs add correct SMTP configurations to `apps/ourvoice-out-api/.env` and `apps/ourvoice-api/.env`

Irregular use:

- Run `pnpm dev` in corresponding `app` directory to start that app in development mode
- Run from the root `pnpm run clean` to clean all apps directories (delete `dist` and `node_modules`) folders. Assume this is needed after pulling an updated version of the code from the remote repository.
- Run from the root `pnpm lint` to show all lint errors and `pnpm lint:fix` to auto fix if possible

Local ports and URL reference:
| Service | Port | Dev URL |
| ------- | ---- | -------------------------------- |
| Portal | 3011 | http://portal.ourvoice.test/ |
| App | 3010 | http://demo.ourvoice.test/ |
| Admin | 3020 | http://admin.ourvoice.test/ |
| Auth | 3030 | http://auth.ourvoice.test/ |
| API | 3000 | http://api.ourvoice.test/ |
| Auth API| 3001 | http://authapi.ourvoice.test/ |

> NOTE: currently only `demo` deployment is added via [config/config.yml](./config/config.yml). If more is added then they also need to be added to the `hosts` file described in [Prerequisites](####Prerequisites)

## 🕸️ Structure

### WebApp for users

> TBD

### WebApp for admins

>

### API

> TBD

## ✍️ Contributing

Fork the repo, make some changes, submit a pull-request.

## 📝 License

Apache License © 2023-PRESENT
