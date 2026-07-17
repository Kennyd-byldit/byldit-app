import '../account-pages.css'

function BYLDitLogo() {
  return (
    <span className="accountPageLogo" aria-label="BYLDit">
      <span className="accountPageLogoByld">BYLD</span>
      <span className="accountPageLogoIt">it</span>
    </span>
  )
}

export default function BillingPage() {
  return (
    <main className="accountPageShell">
      <nav className="accountPageNav">
        <a href="/garage" aria-label="Back to garage"><BYLDitLogo /></a>
        <a className="accountPageBack" href="/garage">Back to Garage</a>
      </nav>

      <section className="accountPageMain">
        <div className="accountPageHero">
          <p>Billing</p>
          <h1>Plan and payment.</h1>
        </div>

        <nav className="settingsNav" aria-label="Settings sections">
          <a href="/profile-setup?from=garage">Profile</a>
          <a className="active" href="/billing">Billing</a>
          <a href="/account-settings">Account</a>
          <a href="/help-support">Help & Support</a>
        </nav>

        <div className="accountCardGrid">
          <article className="accountCard">
            <p className="accountCardLabel">Current Plan</p>
            <h2>BYLDit Preview</h2>
            <p>Your account is currently using the early preview plan while billing is being finalized.</p>
            <div className="accountButtonRow">
              <button className="accountPrimaryButton" type="button">Manage Plan</button>
            </div>
          </article>

          <article className="accountCard">
            <p className="accountCardLabel">Payment Method</p>
            <h2>No card on file</h2>
            <p>Credit card and payment method controls will live here when billing is enabled.</p>
            <div className="accountButtonRow">
              <button className="accountSecondaryButton" type="button">Add Payment Method</button>
            </div>
          </article>

          <article className="accountCard full">
            <p className="accountCardLabel">Invoices</p>
            <h2>Billing history will appear here.</h2>
            <p>Once paid plans are active, this area will show invoices, receipts, and billing contact information.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
