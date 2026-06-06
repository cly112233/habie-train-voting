import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">🎭 哈比列车</h1>
          <p className="text-muted text-sm">自制角色投票社区</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
