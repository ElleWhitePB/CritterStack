import { useState, useEffect } from "react";
import { api } from "./services/api";
import { generateCreatureName, generateSpeciesName } from "./utils/nameGenerator";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  const [creatures, setCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [creatureId, setCreatureId] = useState("");
  const [newCreature, setNewCreature] = useState({ name: "", speciesName: "", lore: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [species, setSpecies] = useState([]);
  const [isNewSpecies, setIsNewSpecies] = useState(false);
	const [isEditingLore, setIsEditingLore] = useState(false);
	const [loreDraft, setLoreDraft] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const creaturesPerPage = 6;

  // Fetch species on component mount
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await api.getAllSpecies();
        setSpecies(data);
      } catch (error) {
        showToast("Failed to load species", "error");
      }
    };
    fetchSpecies();
  }, []);

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
    if (!newCreature.speciesName) {
      showToast("Please select a species", "error");
      return;
    }

    // If creating a new species, do that first
    if (isNewSpecies) {
      try {
        await api.createSpecies({ name: newCreature.speciesName, lore: newCreature.lore });
      } catch (error) {
        showToast(error.message, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const creatureData = { name: newCreature.name, speciesName: newCreature.speciesName };
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

	const selectedSpecies = species.find((s) => s.name === newCreature.speciesName);
	const selectedSpeciesLore = selectedSpecies?.lore;
	const defaultLoreMessage =
		"Lore unavailable. Every expert sent to study this creature has returned with more questions than equipment.";

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
										<label htmlFor="species-lore">Species Lore (optional)</label>
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
											)
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
							<p>
								<strong>ID:</strong> {selectedCreature.id}
							</p>
							<p>
								<strong>Created:</strong>{" "}
								{new Date(selectedCreature.createdAt).toLocaleString()}
							</p>
							<p>
								<strong>Species:</strong> {selectedCreature.speciesName}
							</p>

							<div className="species-lore">
								<div className="lore-header">
									<span className="lore-icon">📜</span>
									<strong>Species Lore</strong>
								</div>
									<p>
										{selectedCreature.species?.lore || defaultLoreMessage}
									</p>
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

export default App;
