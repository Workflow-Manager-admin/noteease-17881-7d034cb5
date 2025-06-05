import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * Main container for the NoteEase app.
 * Handles: note listing, CRUD operations, categories, search, and main UI layout.
 */
function NoteEaseMain() {
  // Note and category structure
  const defaultCategories = [
    { id: "all", name: "All" },
    { id: "personal", name: "Personal" },
    { id: "work", name: "Work" },
    { id: "ideas", name: "Ideas" }
  ];

  // Example initial notes (could be replaced with persistent backend)
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Welcome to NoteEase",
      content: "Start taking notes easily and organize them with categories.",
      category: "personal",
      createdAt: new Date()
    },
    {
      id: 2,
      title: "Project Ideas",
      content: "Brainstorm ideas for your next project here!",
      category: "ideas",
      createdAt: new Date()
    }
  ]);
  const [categories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState(null); // note id or null
  const [isCreating, setIsCreating] = useState(false);

  // FILTER notes by category and search
  const filteredNotes = notes.filter((note) => {
    const matchCategory =
      selectedCategory === "all" || note.category === selectedCategory;
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Start creating a note
  // PUBLIC_INTERFACE
  function handleCreateNote() {
    setEditingNote(null);
    setIsCreating(true);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(noteId) {
    setEditingNote(noteId);
    setIsCreating(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    // If deleted note is being edited, reset editor
    if (editingNote === noteId) setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote({ id, title, content, category }) {
    if (id) {
      // Edit existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, title, content, category } : n
        )
      );
      setEditingNote(null);
    } else {
      // New note
      const newNote = {
        id: Date.now(),
        title,
        content,
        category: category || "personal",
        createdAt: new Date()
      };
      setNotes((prev) => [newNote, ...prev]);
      setIsCreating(false);
    }
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setEditingNote(null);
    setIsCreating(false);
  }

  // Derive editingNoteData if in edit mode
  const editingNoteData =
    editingNote != null
      ? notes.find((n) => n.id === editingNote)
      : null;

  return (
    <div className="noteease-root">
      <div className="noteease-sidebar">
        <div className="noteease-logo">📝 <span>NoteEase</span></div>
        <div className="noteease-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={
                "noteease-category-btn" +
                (selectedCategory === cat.id ? " active" : "")
              }
              onClick={() => {
                setSelectedCategory(cat.id);
                setEditingNote(null);
                setIsCreating(false);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <main className="noteease-main">
        <div className="noteease-topbar">
          <input
            className="noteease-search"
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <div className="noteease-content">
          <section className="noteease-list-section">
            <ul className="noteease-note-list">
              {filteredNotes.length === 0 ? (
                <li className="noteease-note-empty">
                  <span>No notes found.</span>
                </li>
              ) : (
                filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    className={
                      "noteease-note-list-item" +
                      ((editingNote === note.id) ? " selected" : "")
                    }
                    onClick={() => handleEditNote(note.id)}
                  >
                    <div className="noteease-note-title">{note.title}</div>
                    <div className="noteease-note-snippet">
                      {note.content.slice(0, 48)}
                      {note.content.length > 48 ? "..." : ""}
                    </div>
                    <span className="noteease-note-cat-label">
                      {
                        categories.find((cat) => cat.id === note.category)?.name ||
                        note.category
                      }
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section className="noteease-editor-section">
            {/* Show Create/Edit Form if needed */}
            {isCreating || editingNote ? (
              <NoteEditor
                key={isCreating ? "creator" : `edit-${editingNote}`}
                note={editingNoteData}
                categories={categories.filter((c) => c.id !== "all")}
                onSave={handleSaveNote}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="noteease-preview-message">
                <span>
                  {filteredNotes.length === 0
                    ? "No note selected. Create a note to get started!"
                    : "Select a note to view or edit here."}
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Floating action button */}
        {!isCreating && !editingNote && (
          <button
            className="noteease-fab"
            aria-label="Create note"
            title="Create note"
            onClick={handleCreateNote}
          >
            +
          </button>
        )}
      </main>
    </div>
  );
}

/**
 * Editor component for creating or editing notes.
 */
function NoteEditor({ note, categories, onSave, onCancel }) {
  const isEdit = !!note;
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [category, setCategory] = useState(note ? note.category : categories[0]?.id || "personal");

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave({
        id: isEdit ? note.id : undefined,
        title: title.trim(),
        content: content.trim(),
        category
      });
    }
  }

  return (
    <form className="noteease-editor-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="noteease-editor-header">
        <input
          className="noteease-editor-title"
          type="text"
          placeholder="Title"
          maxLength={60}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="noteease-editor-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="noteease-editor-content"
        placeholder="Write your note here..."
        rows={10}
        maxLength={2000}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="noteease-editor-actions">
        <button
          className="noteease-btn noteease-btn-accent"
          type="submit"
          disabled={!title.trim() || !content.trim()}
        >
          {isEdit ? "Save Changes" : "Add Note"}
        </button>
        <button className="noteease-btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {isEdit && (
          <button
            className="noteease-btn noteease-btn-delete"
            type="button"
            onClick={() => onSave({ ...note, deleted: true })}
            tabIndex={-1}
            style={{ marginLeft: "auto" }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

export default NoteEaseMain;
