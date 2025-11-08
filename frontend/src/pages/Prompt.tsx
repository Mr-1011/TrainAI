import { AIInput } from "@/components/ui/AIInput";
import { AnimatedDotsBackground } from "@/components/ui/animated-dots-background";

export default function Prompt() {
  return (
    <div className="flex justify-center p-4 pt-20 relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 z-0 -mx-6 -my-6">
        <AnimatedDotsBackground />
      </div>
      <div className="relative z-10 w-full">
        <AIInput />
      </div>
    </div>
  );
}
