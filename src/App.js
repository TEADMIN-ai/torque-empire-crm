import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

const vehicles = [
  {
    name: 'VW Citi Golf',
    description:
      'Lightweight Jozi legend perfect for courier gigs and neighborhood cruising.',
    focus: ['Starter ride', 'Affordable upgrades', 'Iconic exhaust note'],
  },
  {
    name: 'VW Golf VR6',
    description:
      'Naturally aspirated power with unmistakable VR6 soundtrack for enthusiast runs.',
    focus: ['Responsive handling', 'Deep tuning tree', 'Meaty torque band'],
  },
  {
    name: 'VW Golf GTI Mk5 / Mk6 / Mk7',
    description:
      'Turbocharged trilogy covering three generations of GTI fan favorites.',
    focus: ['Adaptive traction control', 'Launch modes', 'Customizable interiors'],
  },
  {
    name: 'VW Caravelle Minibus',
    description:
      'Taxi-rank hero doubling as a family hauler with crew-co-op missions.',
    focus: ['Passenger management', 'Route entrepreneurship', 'Sound system upgrades'],
  },
  {
    name: 'BMW E30 325i / 325is / 333i',
    description:
      'Timeless Bavarian classics tuned for township showdowns and track days alike.',
    focus: ['Drift events', 'High-rev audio modeling', 'Community car-meet missions'],
  },
];

const milestones = [
  {
    title: 'Vertical Slice',
    bulletPoints: [
      'Single Braamfontein-inspired block with day/night ambience.',
      'Playable VW Citi Golf with foundational physics and tactile audio loop.',
      'Courier jobs with SAPS/JMPD encounter prototypes.',
    ],
  },
  {
    title: 'Vehicle & Character Expansion',
    bulletPoints: [
      'Add BMW E30 fleet and VW Caravelle with dedicated handling tunes.',
      'Garage customization hub for paint, stance, and exhaust swaps.',
      'Lightweight avatar creator mirroring real-life player identity.',
    ],
  },
  {
    title: 'AI Flavor & Economy',
    bulletPoints: [
      'Traffic behaviors influenced by time, weather, and neighborhood vibe.',
      'Bribe-or-fine police encounters, community events, and street scenes.',
      'Property, business ownership, and grooming systems feeding passive income.',
    ],
  },
  {
    title: 'Polish & Platform Targets',
    bulletPoints: [
      'Optimization passes for Android touch, iOS gesture, and PC controllers.',
      'Async ghost challenges for delivery and drift leaderboards.',
      'Cinematic intro tour across Soweto, Sandton, and Maboneng landmarks.',
    ],
  },
];

function Section({ title, children }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function VehicleCard({ name, description, focus }) {
  return (
    <article className="vehicle-card">
      <h3>{name}</h3>
      <p>{description}</p>
      <ul>
        {focus.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function MilestoneCard({ title, bulletPoints }) {
  return (
    <article className="milestone-card">
      <h3>{title}</h3>
      <ul>
        {bulletPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}

function Home() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Cars-nJoziDreams // Prototype Portal</p>
        <h1>Feel the Streets. Hear the Legends. Build Tomorrow.</h1>
        <p>
          This interactive blueprint captures the slimmed-down slice of the Cars-nJoziDreams
          vision—an open-world Johannesburg simulation celebrating iconic rides, authentic
          soundscapes, and aspirational lifestyles. Use it as the foundation for sprint planning
          and cross-discipline collaboration.
        </p>
      </header>

      <Section title="Signature Vehicle Line-Up">
        <div className="grid">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.name} {...vehicle} />
          ))}
        </div>
      </Section>

      <Section title="Core Experience Pillars">
        <div className="pillars">
          <div>
            <h3>Audio Authenticity</h3>
            <p>
              Layered recordings—from idle burbles to redline screams—deliver the 100% sonic
              realism that anchors Jozi car culture. Each vehicle uses granular synthesis and
              doppler-aware mixing to react to throttle, environment, and modifications.
            </p>
          </div>
          <div>
            <h3>Scenery Fidelity</h3>
            <p>
              Google Maps reference passes inform street layouts, while photogrammetry-inspired
              art keeps landmarks recognizable. Dynamic weather and golden-hour lighting ensure the
              city feels alive from Soweto sunsets to Sandton skylines.
            </p>
          </div>
          <div>
            <h3>AI-Driven Progression</h3>
            <p>
              Adaptive AI mentors guide players through personal growth arcs—balancing hustle,
              community ties, and vehicle mastery—so their in-game wins mirror real-life dreams.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Roadmap Milestones">
        <div className="grid milestones">
          {milestones.map((milestone) => (
            <MilestoneCard key={milestone.title} {...milestone} />
          ))}
        </div>
      </Section>

      <Section title="Next Actions">
        <ol className="next-actions">
          <li>
            Prototype Braamfontein test loop with spatial audio stubs and a drivable Citi Golf
            build.
          </li>
          <li>
            Record and implement authentic exhaust profiles with loopable neutral, load, and
            overrun layers.
          </li>
          <li>
            Stand up AI encounter sandbox covering SAPS/JMPD stops, community events, and traffic
            flows.
          </li>
          <li>
            Expand progression with property, business, and lifestyle upgrades tied to player
            personas.
          </li>
        </ol>
      </Section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
