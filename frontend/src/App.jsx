import { useState, useEffect, useRef } from "react";
import { api, biomeApi } from "./services/api";
import {
  generateCreatureName,
  generateSpeciesName,
  generateBiomeName,
} from "./utils/nameGenerator";
import Toast from "./components/Toast";
import "./App.css";

const createRandomTwinkleSpot = () => {
  // Bias a bit toward the sides so they peek around cards
  const top = 10 + Math.random() * 80; // 10% - 90%
  const useLeftSide = Math.random() < 0.5;
  const horizontal = useLeftSide
    ? 4 + Math.random() * 14 // 4% - 18%
    : 68 + Math.random() * 14; // 68% - 82%

  return {
    top: `${top}%`,
    left: `${horizontal}%`,
  };
};

function Twinkle({ emoji, durationMs, idleMs }) {
  const [position, setPosition] = useState(() => createRandomTwinkleSpot());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let fadeTimeout;
    let cycleInterval;

    const runCycle = () => {
      setPosition(createRandomTwinkleSpot());
      setVisible(true);

      fadeTimeout = setTimeout(() => {
        setVisible(false);
      }, durationMs);
    };

    runCycle();
    cycleInterval = setInterval(runCycle, durationMs + idleMs);

    return () => {
      clearTimeout(fadeTimeout);
      clearInterval(cycleInterval);
    };
  }, [durationMs, idleMs]);

  return (
    <span
      className="background-twinkle"
      style={{
        top: position.top,
        left: position.left,
        opacity: visible ? 0.9 : 0,
      }}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}

function BackgroundTwinkles() {
  return (
    <div className="background-twinkles" aria-hidden="true">
      <Twinkle emoji="✨" durationMs={700} idleMs={2200} />
      <Twinkle emoji="🍃" durationMs={900} idleMs={2600} />
      <Twinkle emoji="✨" durationMs={800} idleMs={2500} />
    </div>
  );
}

const SECTIONS = [
  { id: "creatures", label: "Creatures", emoji: "🐾" },
  { id: "biomes", label: "Biomes", emoji: "🌿" },
  { id: "chronicle", label: "Chronicle", emoji: "📜" },
];

function SectionNav({ activeSection, onChange }) {
  return (
    <div className="section-nav-container">
      <nav className="section-nav">
        {SECTIONS.map((tab) => (
          <button
            key={tab.id}
            className={`section-tab section-tab--${tab.id} ${activeSection === tab.id ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const isMissing = (val) => !val || val === "unknown";

function BiomesSection() {
  const [biomes, setBiomes] = useState([]);
  const [selectedBiome, setSelectedBiome] = useState(null);
  const [biomeId, setBiomeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingField, setEditingField] = useState(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [newBiome, setNewBiome] = useState({
    name: "", description: "", climate: "", peril_rating: "", magic_level: "",
  });
  const biomesPerPage = 6;
  const biomeDetailRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleGenerateBiomeName = () =>
    setNewBiome((prev) => ({ ...prev, name: generateBiomeName() }));

  useEffect(() => {
    if (selectedBiome && biomeDetailRef.current) {
      biomeDetailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedBiome]);

  const handleSaveField = async (field) => {
    if (!fieldDraft.trim()) { showToast("Field cannot be empty", "error"); return; }
    setLoading(true);
    try {
      const updated = await biomeApi.updateBiome(selectedBiome.id, { [field]: fieldDraft.trim() });
      setSelectedBiome(updated);
      setBiomes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingField(null);
      setFieldDraft("");
      showToast("Field updated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAll = async () => {
    setLoading(true);
    setSelectedBiome(null);
    setCurrentPage(1);
    try {
      const data = await biomeApi.getAllBiomes({ includeInactive: true });
      setBiomes(data);
      showToast(`Found ${data.length} biome${data.length !== 1 ? "s" : ""}`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGetById = async () => {
    if (!biomeId) { showToast("Please enter a biome ID", "error"); return; }
    setLoading(true);
    setBiomes([]);
    try {
      const data = await biomeApi.getBiomeById(biomeId);
      setSelectedBiome(data);
      showToast(`${data.name} found`);
    } catch {
      showToast(`Could not fetch biome with ID ${biomeId}`, "error");
      setSelectedBiome(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBiome.name) { showToast("Name is required", "error"); return; }
    if (!newBiome.description) { showToast("Field notes are required", "error"); return; }
    setLoading(true);
    try {
      const payload = {
        name: newBiome.name,
        description: newBiome.description,
        ...(newBiome.climate && { climate: newBiome.climate }),
        ...(newBiome.peril_rating && { peril_rating: newBiome.peril_rating }),
        ...(newBiome.magic_level && { magic_level: newBiome.magic_level }),
      };
      await biomeApi.createBiome(payload);
      showToast(`${newBiome.name} registered!`);
      setNewBiome({ name: "", description: "", climate: "", peril_rating: "", magic_level: "" });
      if (biomes.length > 0) setBiomes(await biomeApi.getAllBiomes({ includeInactive: true }));
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (biome) => {
    setLoading(true);
    try {
      const updated = await biomeApi.updateBiome(biome.id, { is_active: !biome.is_active });
      setBiomes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      if (selectedBiome?.id === updated.id) setSelectedBiome(updated);
      showToast(`${updated.name} marked ${updated.is_active ? "active" : "inactive"}`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (biome) => {
    setLoading(true);
    try {
      await biomeApi.deleteBiome(biome.id);
      showToast(`${biome.name} decommissioned`);
      setBiomes((prev) => prev.filter((b) => b.id !== biome.id));
      if (selectedBiome?.id === biome.id) { setSelectedBiome(null); setBiomeId(""); }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(biomes.length / biomesPerPage);
  const currentBiomes = biomes.slice(
    (currentPage - 1) * biomesPerPage,
    currentPage * biomesPerPage,
  );

  return (
    <div className="section-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Register Biome */}
      <section className="card card--biomes">
        <h2>Register Biome</h2>
        <form onSubmit={handleCreate} className="create-form">
          <div className="form-group">
            <label htmlFor="biome-name">Name</label>
            <div className="name-input-group">
              <input id="biome-name" type="text" className="input" placeholder="Enter biome name"
                value={newBiome.name}
                onChange={(e) => setNewBiome({ ...newBiome, name: e.target.value })} />
              <button type="button" className="btn btn-help" onClick={handleGenerateBiomeName}>
                🎲 a little help here
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="biome-desc">Field Notes</label>
            <textarea id="biome-desc" className="textarea" rows="3"
              placeholder="Enter field notes for this biome"
              value={newBiome.description}
              onChange={(e) => setNewBiome({ ...newBiome, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="biome-climate">Climate (optional)</label>
              <input id="biome-climate" type="text" className="input" placeholder="e.g. temperate"
                value={newBiome.climate}
                onChange={(e) => setNewBiome({ ...newBiome, climate: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="biome-peril">Peril Rating (optional)</label>
              <input id="biome-peril" type="text" className="input" placeholder="e.g. moderate"
                value={newBiome.peril_rating}
                onChange={(e) => setNewBiome({ ...newBiome, peril_rating: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="biome-magic">Magic Level (optional)</label>
              <input id="biome-magic" type="text" className="input" placeholder="e.g. high"
                value={newBiome.magic_level}
                onChange={(e) => setNewBiome({ ...newBiome, magic_level: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-biome-primary" disabled={loading}>
            {loading ? "Registering..." : "Register Biome"}
          </button>
        </form>
      </section>

      {/* All Biomes */}
      <section className="card card--biomes">
        <h2>All Biomes</h2>
        <button className="btn btn-biome-primary" onClick={handleGetAll} disabled={loading}>
          {loading ? "Loading..." : "Load All Biomes"}
        </button>
        {biomes.length > 0 && (
          <>
            <div className="pagination-info">
              {`Showing ${(currentPage - 1) * biomesPerPage + 1}–${Math.min(currentPage * biomesPerPage, biomes.length)} of ${biomes.length} biomes`}
            </div>
            <div className="biome-grid">
              {currentBiomes.map((biome) => (
                <div key={biome.id}
                  className={`biome-card${!biome.is_active ? " biome-card--inactive" : ""}${selectedBiome?.id === biome.id ? " biome-card--selected" : ""}`}
                  onClick={() => { setSelectedBiome(biome); setBiomeId(biome.id); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && (setSelectedBiome(biome), setBiomeId(biome.id))}>
                  <div className="biome-card-header">
                    <h3>{biome.name}</h3>
                    <span className={`biome-badge biome-badge--${biome.is_active ? "active" : "inactive"}`}>
                      {biome.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="biome-card-desc">{biome.description}</p>
                  <div className="biome-card-tags">
                    {!isMissing(biome.climate) && <span className="biome-tag">🌤 {biome.climate}</span>}
                    {!isMissing(biome.peril_rating) && <span className="biome-tag">⚠️ {biome.peril_rating}</span>}
                    {!isMissing(biome.magic_level) && <span className="biome-tag">✨ {biome.magic_level}</span>}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-biome-secondary" disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}>← Previous</button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setCurrentPage(n)}
                      className={`btn btn-page${currentPage === n ? " active" : ""}`}>{n}</button>
                  ))}
                </div>
                <button className="btn btn-biome-secondary" disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Get by ID */}
      <section className="card card--biomes" ref={biomeDetailRef}>
        <h2>Get Biome by ID</h2>
        <div className="form-row">
          <input type="number" className="input" placeholder="Enter biome ID" value={biomeId}
            onChange={(e) => setBiomeId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGetById()} />
          <button className="btn btn-biome-secondary" onClick={handleGetById} disabled={loading}>
            {loading ? "Loading..." : "Get by ID"}
          </button>
        </div>
        {selectedBiome && (
          <div className="biome-detail">
            <div className="detail-species-row">
              <h3>{selectedBiome.name}</h3>
              <div className="biome-detail-header-actions">
                <span className={`biome-badge biome-badge--${selectedBiome.is_active ? "active" : "inactive"}`}>
                  {selectedBiome.is_active ? "Active" : "Inactive"}
                </span>
                <button className="btn btn-biome-secondary btn-sm" disabled={loading}
                  onClick={() => handleToggleActive(selectedBiome)}>
                  {selectedBiome.is_active ? "Deactivate" : "Activate"}
                </button>
                <button className="btn btn-danger btn-danger--sm" disabled={loading}
                  onClick={() => handleDelete(selectedBiome)}>
                  🗑 Remove
                </button>
              </div>
            </div>

            <p><strong>ID:</strong> {selectedBiome.id}</p>
            <div className="biome-description-box">
              <div className="biome-description-header">
                <span>📖</span>
                <span>Field Notes</span>
              </div>
              <p>{selectedBiome.description}</p>
            </div>

            {[
              { key: "climate", label: "Climate", icon: "🌤" },
              { key: "peril_rating", label: "Peril Rating", icon: "⚠️" },
              { key: "magic_level", label: "Magic Level", icon: "✨" },
            ].map(({ key, label, icon }) => (
              <div key={key} className="biome-field-row">
                <strong>{label}:</strong>
                {editingField === key ? (
                  <div className="biome-field-edit">
                    <input className="input" value={fieldDraft} placeholder={`Enter ${label.toLowerCase()}`}
                      onChange={(e) => setFieldDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveField(key)} />
                    <button className="btn btn-biome-secondary btn-sm" disabled={loading}
                      onClick={() => handleSaveField(key)}>Save</button>
                    <button className="btn btn-sm btn-cancel" onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                ) : isMissing(selectedBiome[key]) ? (
                  <div className="biome-field-missing">
                    <span className="biome-field-empty">Not recorded</span>
                    <button className="btn btn-help btn-sm"
                      onClick={() => { setEditingField(key); setFieldDraft(""); }}>
                      {icon} Add {label}
                    </button>
                  </div>
                ) : (
                  <span className="biome-field-value">{selectedBiome[key]}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChronicleSection() {
  return (
    <div className="section-content">
      <section className="card card--chronicle">
        <div className="coming-soon">
          <span className="coming-soon-icon">📚</span>
          <h2>Event Chronicle</h2>
          <p className="coming-soon-text">
            The Department&apos;s archivist has stepped out. The Chronicle — a
            complete record of creature sightings, biome incidents, and other
            peculiarities — is still being compiled from water-damaged field
            reports.
          </p>
          <span className="coming-soon-badge">Service arriving in M3</span>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [creatures, setCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [creatureId, setCreatureId] = useState("");
  const [newCreature, setNewCreature] = useState({
    name: "",
    speciesName: "",
    lore: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [species, setSpecies] = useState([]);
  const [isNewSpecies, setIsNewSpecies] = useState(false);
  const [isEditingLore, setIsEditingLore] = useState(false);
  const [loreDraft, setLoreDraft] = useState("");
  const [activeSection, setActiveSection] = useState("creatures");
  const [currentPage, setCurrentPage] = useState(1);
  const creaturesPerPage = 6;
  const creatureDetailRef = useRef(null);

  // Fetch species on component mount
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await api.getAllSpecies();
        setSpecies(data);
      } catch (error) {
        // Log details for debugging while keeping the user-facing message friendly
        console.error(error);
        showToast("Failed to load species", "error");
      }
    };
    fetchSpecies();
  }, []);

  useEffect(() => {
    if (selectedCreature && creatureDetailRef.current) {
      creatureDetailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedCreature]);

  const handleDeleteCreature = async (id) => {
    setLoading(true);
    try {
      await api.deleteCreature(id);
      showToast("Creature decommissioned.");
      setSelectedCreature(null);
      setCreatureId("");
      if (creatures.length > 0) {
        const updated = await api.getAllCreatures();
        setCreatures(updated);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const resetForm = () => {
    setNewCreature({ name: "", speciesName: "", lore: "" });
    setIsNewSpecies(false);
    setIsEditingLore(false);
    setLoreDraft("");
  };

  const handleGetAllCreatures = async () => {
    resetForm();
    setCreatureId("");
    setLoading(true);
    setSelectedCreature(null);
    setCurrentPage(1); // Reset to first page when loading new data
    try {
      const data = await api.getAllCreatures();
      setCreatures(data);
      showToast(`Found ${data.length} creatures`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastCreature = currentPage * creaturesPerPage;
  const indexOfFirstCreature = indexOfLastCreature - creaturesPerPage;
  const currentCreatures = creatures.slice(
    indexOfFirstCreature,
    indexOfLastCreature,
  );
  const totalPages = Math.ceil(creatures.length / creaturesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleGetById = async () => {
    if (!creatureId) {
      showToast("Please enter a creature ID", "error");
      return;
    }
    resetForm();
    setLoading(true);
    setCreatures([]);
    try {
      const data = await api.getCreatureById(creatureId);
      setSelectedCreature(data);
      showToast(`${data.name} found with ID ${creatureId}`);
    } catch {
      showToast(`Could not fetch creature with ID ${creatureId}`, "error");
      setSelectedCreature(null);
    } finally {
      setLoading(false);
    }
  };

  const handleIdKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGetById();
    }
  };

  const handleCreateCreature = async (e) => {
    e.preventDefault();
    if (!newCreature.name) {
      showToast("Please enter a creature name", "error");
      return;
    }
    if (!newCreature.speciesName) {
      showToast("Please select a species", "error");
      return;
    }

    // If creating a new species, do that first
    if (isNewSpecies) {
      try {
        await api.createSpecies({
          name: newCreature.speciesName,
          lore: newCreature.lore,
        });
      } catch (error) {
        showToast(error.message, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const creatureData = {
        name: newCreature.name,
        speciesName: newCreature.speciesName,
      };
      const created = await api.createCreature(creatureData);
      showToast(`${created.name} created successfully!`);
      resetForm();
      // Refresh the species list and creature list
      const updatedSpecies = await api.getAllSpecies();
      setSpecies(updatedSpecies);
      if (creatures.length > 0) {
        handleGetAllCreatures();
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCreatureName = () => {
    const name = generateCreatureName();
    setNewCreature({ ...newCreature, name });
  };

  const handleGenerateSpeciesName = () => {
    const speciesName = generateSpeciesName();
    setNewCreature({ ...newCreature, speciesName });
  };

  const handleSpeciesChange = (e) => {
    const speciesName = e.target.value;
    setIsEditingLore(false);
    setLoreDraft("");
    if (speciesName === "new") {
      setIsNewSpecies(true);
      setNewCreature({ ...newCreature, speciesName: "", lore: "" });
    } else {
      setIsNewSpecies(false);
      setNewCreature({ ...newCreature, speciesName, lore: "" });
    }
  };

  const handleSaveLoreReport = async () => {
    if (!newCreature.speciesName) {
      showToast("Please select a species", "error");
      return;
    }

    if (!loreDraft || !loreDraft.trim()) {
      showToast("Please enter some lore before saving", "error");
      return;
    }

    setLoading(true);
    try {
      const updatedSpecies = await api.updateSpecies({
        name: newCreature.speciesName,
        lore: loreDraft,
      });

      setSpecies((prev) =>
        prev.map((s) => (s.name === updatedSpecies.name ? updatedSpecies : s)),
      );

      showToast(`Lore report added for ${updatedSpecies.name}`);
      setIsEditingLore(false);
      setLoreDraft("");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedSpecies = species.find(
    (s) => s.name === newCreature.speciesName,
  );
  const selectedSpeciesLore = selectedSpecies?.lore;
  const defaultLoreMessage =
    "Lore unavailable. Every expert sent to study this creature has returned with more questions than equipment.";

  return (
    <div className="app">
      <BackgroundTwinkles />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="header">
        <h1>🦎 Department of Peculiar Creatures 🌿</h1>
        <p className="subtitle">✨ Magical Creature Management System ✨</p>
      </header>

      <SectionNav activeSection={activeSection} onChange={setActiveSection} />

      <main className="main">
        {activeSection === "biomes" && <BiomesSection />}
        {activeSection === "chronicle" && <ChronicleSection />}
        {activeSection === "creatures" && <div className="section-content">
        {/* Create Creature Section */}
        <section className="card">
          <h2>Create Creature</h2>
          <form onSubmit={handleCreateCreature} className="create-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <div className="name-input-group">
                <input
                  id="name"
                  type="text"
                  value={newCreature.name}
                  onChange={(e) =>
                    setNewCreature({ ...newCreature, name: e.target.value })
                  }
                  onKeyDown={handleIdKeyDown}
                  placeholder="Enter creature name"
                  className="input"
                />
                <button
                  type="button"
                  onClick={handleGenerateCreatureName}
                  className="btn btn-help"
                >
                  🎲 a little help here
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="species">Species</label>
              <select
                id="species"
                value={isNewSpecies ? "new" : newCreature.speciesName}
                onChange={handleSpeciesChange}
                className="select"
              >
                <option value="" disabled hidden>
                  Choose a species
                </option>
                {species.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="new">+ Report New Species</option>
              </select>

              {isNewSpecies && (
                <>
                  <div className="form-group new-species-field">
                    <label htmlFor="species-name">Species Name</label>
                    <div className="name-input-group">
                      <input
                        id="species-name"
                        type="text"
                        placeholder="Enter species name"
                        value={newCreature.speciesName}
                        onChange={(e) =>
                          setNewCreature({
                            ...newCreature,
                            speciesName: e.target.value,
                          })
                        }
                        className="input"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSpeciesName}
                        className="btn btn-help"
                      >
                        🎲 a little help here
                      </button>
                    </div>
                  </div>
                  <div className="form-group new-species-field">
                    <label htmlFor="species-lore">
                      Species Lore (optional)
                    </label>
                    <textarea
                      id="species-lore"
                      placeholder="Enter species lore"
                      value={newCreature.lore}
                      onChange={(e) =>
                        setNewCreature({
                          ...newCreature,
                          lore: e.target.value,
                        })
                      }
                      className="textarea"
                      rows="4"
                    />
                  </div>
                </>
              )}

              {!isNewSpecies && newCreature.speciesName && (
                <div className="species-lore">
                  <div className="lore-header">
                    <span className="lore-icon">📜</span>
                    <strong>Species Lore</strong>
                  </div>
                  {isEditingLore ? (
                    <div className="form-group new-species-field">
                      <label htmlFor="existing-species-lore">
                        Species Lore (optional)
                      </label>
                      <textarea
                        id="existing-species-lore"
                        placeholder="Enter species lore"
                        value={loreDraft}
                        onChange={(e) => setLoreDraft(e.target.value)}
                        className="textarea"
                        rows="4"
                      />
                      <button
                        type="button"
                        onClick={handleSaveLoreReport}
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        Save Report
                      </button>
                    </div>
                  ) : (
                    <div className="species-lore-content">
                      <p>{selectedSpeciesLore || defaultLoreMessage}</p>
                      {!selectedSpeciesLore && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-lore-inline"
                          onClick={() => {
                            setIsEditingLore(true);
                            setLoreDraft("");
                          }}
                          disabled={loading}
                        >
                          Add Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating..." : "Create Creature"}
            </button>
          </form>
        </section>

        {/* Get All Creatures Section */}
        <section className="card">
          <h2>Get All Creatures</h2>
          <button
            onClick={handleGetAllCreatures}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Loading..." : "Get All Creatures"}
          </button>

          {creatures.length > 0 && (
            <>
              <div className="pagination-info">
                Showing {indexOfFirstCreature + 1}-
                {Math.min(indexOfLastCreature, creatures.length)} of{" "}
                {creatures.length} creatures
              </div>

              <div className="creatures-list">
                {currentCreatures.map((creature) => (
                  <div
                    key={creature.id}
                    className="creature-card"
                    onClick={() => {
                      setSelectedCreature(creature);
                      setCreatureId(creature.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h3>{creature.name}</h3>
                    <p>
                      <strong>ID:</strong> {creature.id}
                    </p>
                    <p>
                      <strong>Species:</strong> {creature.speciesName}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(creature.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                  >
                    ← Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageClick(pageNum)}
                          className={`btn btn-page ${currentPage === pageNum ? "active" : ""}`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Get by ID Section */}
        <section className="card" ref={creatureDetailRef}>
          <h2>Get Creature by ID</h2>
          <div className="form-row">
            <input
              type="number"
              value={creatureId}
              onChange={(e) => setCreatureId(e.target.value)}
              onKeyDown={handleIdKeyDown}
              placeholder="Enter creature ID"
              className="input"
            />
            <button
              onClick={handleGetById}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? "Loading..." : "Get by ID"}
            </button>
          </div>

          {selectedCreature && (
            <div className="creature-detail">
              <h3>{selectedCreature.name}</h3>
              <p>
                <strong>ID:</strong> {selectedCreature.id}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(selectedCreature.createdAt).toLocaleString()}
              </p>
              <div className="detail-species-row">
                <p>
                  <strong>Species:</strong> {selectedCreature.speciesName}
                </p>
                <button
                  className="btn btn-danger btn-danger--sm"
                  onClick={() => handleDeleteCreature(selectedCreature.id)}
                  disabled={loading}
                >
                  🗑 Decommission
                </button>
              </div>

              <div className="species-lore">
                <div className="lore-header">
                  <span className="lore-icon">📜</span>
                  <strong>Species Lore</strong>
                </div>
                <p>{selectedCreature.species?.lore || defaultLoreMessage}</p>
              </div>
            </div>
          )}
        </section>
        </div>}
      </main>
    </div>
  );
}

export default App;
