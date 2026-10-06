import Link from "next/link";

/** Any unknown address: a calm page with a way back, instead of a bare 404. */
export default function NotFound() {
  return (
    <div className="mentor-auth" style={{ maxWidth: 520, minHeight: "80vh", justifyContent: "center", textAlign: "center" }}>
      <div className="card apply" style={{ alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>404</h1>
        <p className="lead" style={{ margin: 0 }}>This page doesn&apos;t exist. · هذه الصفحة غير موجودة · এই পাতাটি নেই</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn" href="/">Home</Link>
          <Link className="btn sec" href="/user/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
