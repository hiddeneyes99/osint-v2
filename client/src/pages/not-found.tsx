import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { CyberCard } from "@/components/CyberCard";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="scanline" />
      <CyberCard className="max-w-md w-full text-center py-12 border-destructive/50">
        <div className="icon3d t-orange w-20 h-20 rounded-3xl mx-auto mb-6">
          <span className="e text-4xl select-none">⚠️</span>
        </div>
        <h1 className="text-4xl font-bold text-destructive mb-2 font-display">404 ERROR</h1>
        <p className="text-muted-foreground mb-8 font-mono">
          RESOURCE NOT FOUND OR ACCESS RESTRICTED.<br/>
          THE REQUESTED PATH DOES NOT EXIST IN THIS REALITY.
        </p>
        <Link href="/">
          <CyberButton variant="outline" className="w-full">
            RETURN TO BASE
          </CyberButton>
        </Link>
      </CyberCard>
    </div>
  );
}
