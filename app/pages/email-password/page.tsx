import EmailPasswordDemo from "../../components/EmailPasswordDemo";

export default function EmailPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl">
        <EmailPasswordDemo user={null} />
      </div>
    </main>
  );
}