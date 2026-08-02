import './style.css'
import keycloak from './keycloak.js'

async function main() {
  // checkLoginIframe はデフォルト true だが、サードパーティ Cookie を
  // ブロックするブラウザでは正しく機能しないため明示的に無効化する。
  // 詳しくは Part 4.1 を参照。
  const authenticated = await keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })

  if (!authenticated) {
    renderUnauthenticated()
    return
  }

  renderAuthenticated()
}

function renderAuthenticated() {
  const { preferred_username } = keycloak.tokenParsed
  const isAdmin = keycloak.hasRealmRole('admin')

  document.querySelector('#app').innerHTML = `
    <section>
      <h1>ログイン成功</h1>
      <p>ようこそ、<strong>${preferred_username}</strong> さん。</p>
      <button id="logout">ログアウト</button>
    </section>

    <section>
      <h2>メニュー</h2>
      <ul>
        <li>ダッシュボード（全ユーザーに表示）</li>
        ${isAdmin ? '<li>ユーザー管理（admin ロールを持つユーザーにのみ表示）</li>' : ''}
      </ul>
    </section>

    <section>
      <h2>アクセストークン</h2>
      <p id="token-expiry"></p>
      <button id="refresh">トークンを更新する</button>
      <h3>ID トークンの中身</h3>
      <pre id="id-token"></pre>
    </section>

    <section>
      <h2>API を呼び出す</h2>
      <p>handson/api（http://localhost:3000）を呼び出します。</p>
      <button id="call-public">/api/public を呼ぶ</button>
      <button id="call-protected">/api/protected を呼ぶ</button>
      <button id="call-admin">/api/admin を呼ぶ</button>
      <pre id="api-result">（まだ呼び出していません）</pre>
    </section>
  `

  document.querySelector('#logout').addEventListener('click', () => {
    keycloak.logout({ redirectUri: window.location.origin + '/' })
  })
  document.querySelector('#refresh').addEventListener('click', () => refreshToken())
  document.querySelector('#call-public').addEventListener('click', () => callApi('/api/public', false))
  document.querySelector('#call-protected').addEventListener('click', () => callApi('/api/protected', true))
  document.querySelector('#call-admin').addEventListener('click', () => callApi('/api/admin', true))

  renderTokenInfo()
  setInterval(renderTokenInfo, 1000)
}

const API_BASE_URL = 'http://localhost:3000'

async function callApi(path, withToken) {
  const resultEl = document.querySelector('#api-result')
  resultEl.textContent = '呼び出し中...'

  const headers = withToken ? { Authorization: `Bearer ${keycloak.token}` } : {}
  const res = await fetch(API_BASE_URL + path, { headers })
  const body = await res.json()

  resultEl.textContent = `HTTP ${res.status}\n${JSON.stringify(body, null, 2)}`
}

function renderTokenInfo() {
  const expiryEl = document.querySelector('#token-expiry')
  const idTokenEl = document.querySelector('#id-token')
  if (!expiryEl || !idTokenEl) return

  const expiresAt = new Date(keycloak.tokenParsed.exp * 1000)
  const secondsLeft = Math.max(0, Math.round(keycloak.tokenParsed.exp - Date.now() / 1000))

  expiryEl.textContent = `有効期限: ${expiresAt.toLocaleTimeString('ja-JP')}（あと ${secondsLeft} 秒）`
  idTokenEl.textContent = JSON.stringify(keycloak.idTokenParsed, null, 2)
}

async function refreshToken() {
  try {
    const refreshed = await keycloak.updateToken(-1)
    console.log(refreshed ? 'トークンを更新しました' : 'まだ有効期限内のため更新不要でした')
  } catch {
    console.log('トークンの更新に失敗しました。再ログインが必要です')
  }
  renderTokenInfo()
}

function renderUnauthenticated() {
  document.querySelector('#app').innerHTML = `
    <section>
      <h1>認証に失敗しました</h1>
      <p>ページを再読み込みしてもう一度お試しください。</p>
    </section>
  `
}

main()
