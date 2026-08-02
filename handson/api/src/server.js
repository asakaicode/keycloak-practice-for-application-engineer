import express from 'express'
import cors from 'cors'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const KEYCLOAK_URL = 'http://localhost:8080'
const REALM = 'demo'
const ISSUER = `${KEYCLOAK_URL}/realms/${REALM}`
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/protocol/openid-connect/certs`))

const app = express()

// Web Origins（Keycloak 自身のエンドポイント用の CORS 設定）とは別に、
// このアプリ自身の CORS ポリシーとして SPA のオリジンのみを許可する。
app.use(cors({ origin: 'http://localhost:5173' }))

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authorization ヘッダーに Bearer トークンがありません' })
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: 'frontend-spa',
    })
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'トークンが無効です', detail: err.message })
  }
}

function requireRealmRole(role) {
  return (req, res, next) => {
    const roles = req.user.realm_access?.roles ?? []
    if (!roles.includes(role)) {
      return res.status(403).json({ error: `ロール '${role}' が必要です` })
    }
    next()
  }
}

app.get('/api/public', (req, res) => {
  res.json({ message: '認証不要のエンドポイントです。誰でも呼び出せます。' })
})

app.get('/api/protected', requireAuth, (req, res) => {
  res.json({
    message: `こんにちは、${req.user.preferred_username} さん。有効なトークンで呼び出せました。`,
    roles: req.user.realm_access?.roles ?? [],
  })
})

app.get('/api/admin', requireAuth, requireRealmRole('admin'), (req, res) => {
  res.json({ message: `管理者専用エンドポイントです。ようこそ、${req.user.preferred_username} さん。` })
})

const port = 3000
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
