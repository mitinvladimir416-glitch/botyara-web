import { Sparkles, Zap } from "lucide-react";

export default function HomeAICore({ status }) {
  return (
    <aside className="premium-home-ai-object" aria-label="Персональный AI-компаньон БОТЯРА">
      <span className="premium-home-ai-object__reflection" aria-hidden="true" />
      <div className="premium-home-core" aria-hidden="true">
        <span className="premium-home-core__shell" />
        <span className="premium-home-core__orbit premium-home-core__orbit--outer" />
        <span className="premium-home-core__orbit premium-home-core__orbit--inner" />
        <span className="premium-home-core__body"><i /></span>
      </div>

      <div className="premium-home-ai-object__telemetry" aria-label="Состояние AI">
        <span><Zap size={13} strokeWidth={1.5} aria-hidden="true" /> AI Online</span>
        <span><Sparkles size={13} strokeWidth={1.5} aria-hidden="true" /> Готов помочь</span>
      </div>

      <div className="premium-home-ai-object__signal">
        <span className="premium-home-ai-object__mark" aria-hidden="true">Б</span>
        <span><strong>БОТЯРА рядом</strong><small>{status}</small></span>
      </div>
      <div className="premium-home-ai-object__wave" aria-hidden="true">
        {[3, 7, 5, 10, 6, 8, 4].map((height, index) => (
          <i key={index} style={{ "--home-wave-height": `${height}px` }} />
        ))}
      </div>
    </aside>
  );
}
