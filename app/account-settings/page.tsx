import '../account-pages.css'

function BYLDitLogo() {
  return (
    <span className="accountPageLogo" aria-label="BYLDit">
      <span className="accountPageLogoByld">BYLD</span>
      <span className="accountPageLogoIt">it</span>
    </span>
  )
}

export default function AccountSettingsPage() {
  return (
    <main className="accountPageShell">
      <nav className="accountPageNav">
        <a href="/garage" aria-label="Back to garage"><BYLDitLogo /></a>
        <a className="accountPageBack" href="/garage">Back to Garage</a>
      </nav>

      <section className="accountPageMain">
        <div className="accountPageHero">
          <p>Account Settings</p>
          <h1>Login and account controls.</h1>
        </div>

        <nav className="settingsNav" aria-label="Settings sections">
          <a href="/profile-setup?from=garage">Profile</a>
          <a href="/billing">Billing</a>
          <a className="active" href="/account-settings">Account</a>
          <a href="/help-support">Help & Support</a>
        </nav>

        <div className="accountCardGrid">
          <article className="accountCard">
            <p className="accountCardLabel">Email</p>
            <h2>Account email</h2>
            <p>This is where email address management and verification status will live.</p>
            <div className="accountButtonRow">
              <button className="accountSecondaryButton" type="button">Change Email</button>
            </div>
          </article>

          <article className="accountCard">
            <p className="accountCardLabel">Password</p>
            <h2>Password settings</h2>
            <p>Users can reset or change their password from this area.</p>
            <div className="accountButtonRow">
              <a className="accountPrimaryButton" href="/reset-password">Reset Password</a>
            </div>
          </article>

          <article className="accountCard full">
            <p className="accountCardLabel">Account Safety</p>
            <h2>Account controls</h2>
            <p>Sign out, privacy, and future delete-account controls can live here once we decide the final policy language.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
