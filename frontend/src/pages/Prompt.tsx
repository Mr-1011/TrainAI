import { AIInput } from "@/components/ui/AIInput";
import { AnimatedDotsBackground } from "@/components/ui/animated-dots-background";

export default function Prompt() {
  return (
    <div className="flex justify-center p-4 pt-20 relative">
      <div className="fixed inset-0 z-0">
        <AnimatedDotsBackground />
      </div>
      <div className="relative z-10 w-full">
        <AIInput />
      </div>
    </div>
  );
}
