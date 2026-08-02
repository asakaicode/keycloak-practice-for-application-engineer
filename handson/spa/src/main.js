import './style.css'
import keycloak from './keycloak.js'

async function main() {
  const authenticated = await keycloak.init({ onLoad: 'login-required' })

  if (!authenticated) {
    renderUnauthenticated()
    return
  }

  renderAuthenticated()
}

function renderAuthenticated() {
  const { preferred_username } = keycloak.tokenParsed

  document.querySelector('#app').innerHTML = `
    <section>
      <h1>ログイン成功</h1>
      <p>ようこそ、<strong>${preferred_username}</strong> さん。</p>
      <button id="logout">ログアウト</button>
    </section>

    <section>
      <h2>アクセストークン</h2>
      <p id="token-expiry"></p>
      <button id="refresh">トークンを更新する</button>
      <h3>ID トークンの中身</h3>
      <pre id="id-token"></pre>
    </section>
  `

  document.querySelector('#logout').addEventListener('click', () => {
    keycloak.logout({ redirectUri: window.location.origin + '/' })
  })
  document.querySelector('#refresh').addEventListener('click', () => refreshToken())

  renderTokenInfo()
  setInterval(renderTokenInfo, 1000)
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
