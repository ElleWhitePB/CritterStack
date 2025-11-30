import { useState } from "react";
import { api } from "./services/api";
import { SPECIES } from "./constants/species";
import { generatePeculiarName } from "./utils/nameGenerator";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  const [creatures, setCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [creatureId, setCreatureId] = useState("");
  const [newCreature, setNewCreature] = useState({ name: "", species: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const creaturesPerPage = 6;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const resetForm = () => {
    setNewCreature({ name: "", species: "" });
    setSelectedSpecies(null);
  };

  const handleGetAllCreatures = async () => {
    resetForm();
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
  const currentCreatures = creatures.slice(indexOfFirstCreature, indexOfLastCreature);
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
    if (!newCreature.species) {
      showToast("Please select a species", "error");
      return;
    }
    setLoading(true);
    try {
      const created = await api.createCreature(newCreature);
      showToast(`${created.name} created successfully!`);
      setNewCreature({ name: "", species: SPECIES[0].name });
      setSelectedSpecies(SPECIES[0]);
      // Optionally refresh the list
      if (creatures.length > 0) {
        handleGetAllCreatures();
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePeculiarName = () => {
    const name = generatePeculiarName();
    setNewCreature({ ...newCreature, name });
  };

  const handleSpeciesChange = (e) => {
    const speciesName = e.target.value;
    const species = SPECIES.find(s => s.name === speciesName);
    setNewCreature({ ...newCreature, species: speciesName });
    setSelectedSpecies(species);
  };

  return (
    <div className="app">
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

      <main className="main">
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
                Showing {indexOfFirstCreature + 1}-{Math.min(indexOfLastCreature, creatures.length)} of {creatures.length} creatures
              </div>

              <div className="creatures-list">
                {currentCreatures.map((creature) => (
                  <div key={creature.id} className="creature-card">
                    <h3>{creature.name}</h3>
                    <p><strong>Species:</strong> {creature.species}</p>
                    <p><strong>ID:</strong> {creature.id}</p>
                    <p><strong>Created:</strong> {new Date(creature.createdAt).toLocaleString()}</p>
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        className={`btn btn-page ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    ))}
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
        <section className="card">
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
              <p><strong>Species:</strong> {selectedCreature.species}</p>
              <p><strong>ID:</strong> {selectedCreature.id}</p>
              <p><strong>Created:</strong> {new Date(selectedCreature.createdAt).toLocaleString()}</p>
            </div>
          )}
        </section>

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
                  onChange={(e) => setNewCreature({ ...newCreature, name: e.target.value })}
                  onKeyDown={handleIdKeyDown}
                  placeholder="Enter creature name"
                  className="input"
                />
                <button
                  type="button"
                  onClick={handleGeneratePeculiarName}
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
                value={newCreature.species}
                onChange={handleSpeciesChange}
                className="select"
              >
                <option value="" disabled>Choose a species</option>
                {SPECIES.map((species) => (
                  <option key={species.name} value={species.name}>
                    {species.name}
                  </option>
                ))}
              </select>
              {selectedSpecies && (
                <div className="species-lore">
                  <div className="lore-header">
                    <span className="lore-icon">📜</span>
                    <strong>Species Lore</strong>
                  </div>
                  <p>{selectedSpecies.lore}</p>
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
      </main>
    </div>
  );
}

export default App;
