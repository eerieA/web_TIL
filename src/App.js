import { useEffect, useState } from "react";
import supabase from "./supabase.js";
import "./styles.css";

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  //const [facts, setFacts] = useState(initialFacts); //Shared by FactList and NewFactForm
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currCategory, setCurrCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");
        if (currCategory !== "all") {
          query = query.eq("category", currCategory);
        }

        const { data: facts, error } = await query
          .order("votesIntr", { ascending: false })
          .limit(100);

        if (!error) {
          setFacts(facts);
        } else {
          alert("An error occurred while fetching facts.");
        }
        setIsLoading(false);
      }
      getFacts();
    },
    [currCategory]
    //dependencies: whenever they change, the effect is triggered
    //then passed back, sort of like callback parameters
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrCategory={setCurrCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today I Learned";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((s) => !s)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("https://example.com");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxTextLen = 200;

  async function handleSubmit(e) {
    e.preventDefault(); //Prevent page reload

    //If data valid?
    if (
      text &&
      source &&
      category &&
      text.length <= maxTextLen &&
      isValidUrl(source)
    ) {
      //Create new fact object
      //Upload fields to the database, let database generate it and get it back
      setIsSubmitting(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsSubmitting(false);

      //Add the new fact to the state
      if (!error) {
        setFacts((facts) => [newFact[0], ...facts]);
      } else {
        alert("An error occurred while submitting the fact.");
      }

      //Reset the input fields
      setText("");
      setSource("https://example.com");
      setCategory("");

      //Close the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSubmitting}
      />
      <span>{maxTextLen - text.length}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isSubmitting}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isSubmitting}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts found for this category yet. Create one! 😏
      </p>
    );
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} factObj={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the list.</p>
    </section>
  );
}

function Fact({ factObj: fact, setFacts }) {
  //const {fact} = props;
  //const fact = props.factObj;
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesFls > fact.votesIntr + fact.votesMb;

  async function handleVote(colName) {
    setIsUpdating(true);
    //[colName] is a computed property name
    //So if colName = "AString", .update({ [colName]: fact[colName] + 1 }) is
    //the same as .update({ AString: fact.AString + 1 })
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [colName]: fact[colName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);
    if (!error) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⚡DISPUTED]</span> : null}
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votesIntr")} disabled={isUpdating}>
          👍 {fact.votesIntr}
        </button>
        <button onClick={() => handleVote("votesMb")} disabled={isUpdating}>
          🤯 {fact.votesMb}
        </button>
        <button onClick={() => handleVote("votesFls")} disabled={isUpdating}>
          ⛔️ {fact.votesFls}
        </button>
      </div>
    </li>
  );
}

export default App;
