import { DramaticHero } from './components/DramaticHero';
import { ManifestoSection } from './components/ManifestoSection';
import { PhilosophyGrid } from './components/PhilosophyGrid';
import { InteractiveShowcase } from './components/InteractiveShowcase';
import { BreakTheRules } from './components/BreakTheRules';
import { EmotionalClose } from './components/EmotionalClose';
import { MinimalFooter } from './components/MinimalFooter';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <DramaticHero />
      <ManifestoSection />
      <PhilosophyGrid />
      <InteractiveShowcase />
      <BreakTheRules />
      <EmotionalClose />
      <MinimalFooter />
    </div>
  );
}
