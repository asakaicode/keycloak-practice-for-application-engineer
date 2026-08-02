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
  `

  document.querySelector('#logout').addEventListener('click', () => keycloak.logout())
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
