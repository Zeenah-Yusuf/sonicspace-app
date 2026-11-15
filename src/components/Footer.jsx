import { tracks } from "../data/tracks";

const SVS_IDS = [...new Set(Object.values(tracks).map((t) => t.svsId).filter(Boolean))];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-700 px-8 py-10 text-sm text-zinc-300">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <p>
          Visualizations: NASA&apos;s Goddard Space Flight Center, Scientific Visualization Studio
          (SVS):{" "}
          {SVS_IDS.map((id, i) => (
            <span key={id}>
              <a
                href={`https://svs.gsfc.nasa.gov/${id}/`}
                className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
              >
                SVS {id}
              </a>
              {i < SVS_IDS.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
        <p>
          Sounds are generated in your browser from image brightness and are not exact measurements.
          Colors in NASA visualizations are an artistic choice, not raw data values.
        </p>
        {/* P1 only: uncomment when a live GIBS layer is added (spec section 5)
        <p>{GIBS_ACK}</p> */}
        <p>Built for the NASA Space Apps Challenge 2026: The Earth Information Jukebox.</p>
      </div>
    </footer>
  );
}