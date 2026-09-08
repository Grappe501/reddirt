import { signIn, signUp } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">MARKETLAB</p>
        <h1>Enter the market without risking a dollar.</h1>
        <p className="lede">Create your player account, join the Six-Week Classic, and start with $1,000 in simulated cash.</p>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
          <div className="auth-actions">
            <button formAction={signIn}>Sign in</button>
            <button className="secondary" formAction={signUp}>Create account</button>
          </div>
        </form>
        <p className="fine-print">MarketLab executes simulated trades only. No brokerage account is connected.</p>
      </section>
    </main>
  );
}
