import '../account-pages.css'

function BYLDitLogo() {
  return (
    <span className="accountPageLogo" aria-label="BYLDit">
      <span className="accountPageLogoByld">BYLD</span>
      <span className="accountPageLogoIt">it</span>
    </span>
  )
}

export default function HelpSupportPage() {
  return (
    <main className="accountPageShell">
      <nav className="accountPageNav">
        <a href="/garage" aria-label="Back to garage"><BYLDitLogo /></a>
        <a className="accountPageBack" href="/garage">Back to Garage</a>
      </nav>

      <section className="accountPageMain">
        <div className="accountPageHero">
          <p>Help & Support</p>
          <h1>Questions and support.</h1>
        </div>

        <nav className="settingsNav" aria-label="Settings sections">
          <a href="/profile-setup?from=garage">Profile</a>
          <a href="/billing">Billing</a>
          <a href="/account-settings">Account</a>
          <a className="active" href="/help-support">Help & Support</a>
        </nav>

        <article className="accountCard full">
          <p className="accountCardLabel">Q&A</p>
          <h2>Common questions</h2>
          <div className="qaList">
            <details>
              <summary>How do I add another vehicle?</summary>
              <p>Open your garage and use Add Vehicle. The vehicle will be saved to your garage and appear in the command center.</p>
            </details>
            <details>
              <summary>How do I edit a vehicle?</summary>
              <p>Use Edit on the vehicle card in the garage rail. That opens the polished vehicle setup form with your saved details prefilled.</p>
            </details>
            <details>
              <summary>Where do projects, drafts, and history live?</summary>
              <p>Open a vehicle in the garage rail, then choose Overview, Projects, Drafts, or History to update the workbench.</p>
            </details>
            <details>
              <summary>How do I contact support?</summary>
              <p>A contact form will live here later. For now, this page gives us the structure for the support area.</p>
            </details>
          </div>
        </article>
      </section>
    </main>
  )
}
