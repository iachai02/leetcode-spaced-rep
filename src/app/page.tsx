import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Master LeetCode with
          <span className="text-primary"> Spaced Repetition</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stop forgetting solutions. Our SM-2 algorithm schedules reviews at the optimal time,
          so problems stick in your long-term memory.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SM-2 Algorithm</CardTitle>
            <CardDescription>Science-backed learning</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The same algorithm used by Anki. Rate your performance and we&apos;ll calculate
              the perfect time for your next review.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curated Problem Sets</CardTitle>
            <CardDescription>NeetCode 150 & LeetCode 75</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start with battle-tested problem collections. Focus on what matters for
              coding interviews.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Your Progress</CardTitle>
            <CardDescription>Streaks & statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Build consistency with streak tracking. Watch problems move from
              &quot;learning&quot; to &quot;mastered&quot;.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold">Choose a Problem Set</h3>
            <p className="text-sm text-muted-foreground">
              Select NeetCode 150 or LeetCode 75
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold">Solve Problems</h3>
            <p className="text-sm text-muted-foreground">
              Open LeetCode, timer starts automatically
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold">Rate Your Performance</h3>
            <p className="text-sm text-muted-foreground">
              Again, Hard, Medium, or Easy
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold">Review at the Right Time</h3>
            <p className="text-sm text-muted-foreground">
              We schedule your next review optimally
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Ready to retain what you learn?</h2>
        <Link href="/login">
          <Button size="lg">Start Learning</Button>
        </Link>
      </section>
    </div>
  );
}
