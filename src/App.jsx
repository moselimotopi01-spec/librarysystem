/* KINGS LIRARY MANAGEMENT SYSTEM.*/
import { useEffect, useRef, useState } from "react";
import "./App.css";

/* ---------- DATA ---------- */

const APP_KEY = "libraryAppData";

function initialData() {
    return {
        books: [
            { id: "b1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", isbn: "9780743273565", qty: 5 },
            { id: "b2", title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", qty: 1 },
            { id: "b3", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "9780061120084", qty: 0 }
        ],
        users: [
            { id: "u1", name: "admin", membershipId: "ADMIN-001", role: "admin", password: "admin123" }
        ],
        transactions: [],
        currentUser: null
    };
}

function loadData() {
    try {
        const saved = localStorage.getItem(APP_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.books) && Array.isArray(parsed.users)) {
                return {
                    ...parsed,
                    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
                    currentUser: parsed.currentUser || null
                };
            }
        }
    } catch (error) {
        localStorage.removeItem(APP_KEY);
    }
    return initialData();
}

function uid(prefix) {
    return prefix + Date.now() + Math.random().toString(16).slice(2);
}

/* Returns a new transactions array with the latest record first (max 100) */
function withTransaction(transactions, type, bookTitle, quantity) {
    const record = {
        id: uid("t"),
        time: new Date().toLocaleString(),
        type,
        bookTitle,
        quantity
    };
    return [record, ...transactions].slice(0, 100);
}

function formatTransaction(type) {
    const names = {
        add: "Stock added",
        borrow: "Borrowed",
        update: "Book updated",
        delete: "Book deleted",
        "add-book": "Book added"
    };
    return names[type] || "Record";
}

function plural(count, one, many) {
    return `${count} ${count === 1 ? one : many}`;
}

/* Custom hook: whole app state, saved to localStorage on every change */
function useLibraryData() {
    const [data, setData] = useState(loadData);

    useEffect(() => {
        try {
            localStorage.setItem(APP_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Could not save data", error);
        }
    }, [data]);

    return [data, setData];
}

/* ---------- SHARED UI COMPONENTS ---------- */

function Footer() {
    return (
        <footer className="site-footer">
            <p>© 2026 Community Library Management System. All rights reserved.</p>
        </footer>
    );
}

function PageHeading({ eyebrow, title, description }) {
    return (
        <section className="page-heading">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </section>
    );
}

function Panel({ title, eyebrow, countText, children }) {
    return (
        <section className="panel">
            <div className="panel-heading">
                <div>
                    <p className="eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                </div>
                {countText && <span className="count-pill">{countText}</span>}
            </div>
            {children}
        </section>
    );
}

function EmptyState({ icon, title, description }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function Field({ id, label, children }) {
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            {children}
        </div>
    );
}

function Button({ className = "", type = "button", children, ...props }) {
    return (
        <button type={type} className={`button ${className}`} {...props}>
            {children}
        </button>
    );
}

function FormMessage({ message, className = "" }) {
    return (
        <p
            className={`form-message ${className} ${message.type}`.trim()}
            aria-live="polite"
        >
            {message.text}
        </p>
    );
}

const NO_MESSAGE = { text: "", type: "" };

function StatusBadge({ qty }) {
    if (qty === 0) return <span className="status out">Out of stock</span>;
    if (qty < 2) return <span className="status low">Low stock</span>;
    return <span className="status available">Available</span>;
}

/* ---------- LOGIN ---------- */

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(NO_MESSAGE);
    const passwordRef = useRef(null);

    function handleSubmit(event) {
        event.preventDefault();

        if (!username.trim() || !password) {
            setMessage({ text: "Please enter both your username and password.", type: "error" });
            return;
        }

        const error = onLogin(username.trim(), password);
        if (error) {
            setMessage({ text: error, type: "error" });
            setPassword("");
            passwordRef.current?.focus();
        }
    }

    return (
        <div className="login-page">
            <main className="login-card">
                <div className="login-header">
                    <div className="brand-mark" aria-label="Library">📚</div>
                    <p className="eyebrow">COMMUNITY LIBRARY</p>
                    <h1>Library Management System</h1>
                    <p>Sign in to manage books, stock and library accounts.</p>
                </div>

                <form className="form-stack" onSubmit={handleSubmit} noValidate>
                    <Field id="loginUsername" label="Username">
                        <input
                            id="loginUsername"
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            autoComplete="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            required
                        />
                    </Field>

                    <Field id="loginPassword" label="Password">
                        <input
                            id="loginPassword"
                            ref={passwordRef}
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                    </Field>

                    <Button type="submit" className="button-primary button-large full-width">
                        Sign in
                    </Button>
                    <FormMessage message={message} />
                </form>

                <div className="login-note">
                    <strong>First time here?</strong>
                    <p>Sign in with an administrator account. Administrators can create and manage other library accounts.</p>
                </div>

                <Footer />
            </main>
        </div>
    );
}

/* ---------- HEADER ---------- */

const PAGES = [
    ["dashboard", "Dashboard"],
    ["books", "Books"],
    ["transactions", "Transactions"],
    ["users", "Users"]
];

function canView(page, role) {
    if (page === "users") return role === "admin";
    if (page === "transactions") return role !== "member";
    return true;
}

function Header({ activePage, user, onNavigate, onLogout }) {
    return (
        <header className="site-header">
            <a
                className="brand"
                href="#dashboard"
                aria-label="Community Library dashboard"
                onClick={event => {
                    event.preventDefault();
                    onNavigate("dashboard");
                }}
            >
                <span className="brand-icon">📚</span>
                <span>
                    <strong>Community Library</strong>
                    <small>Management System</small>
                </span>
            </a>

            <nav className="main-nav" aria-label="Main navigation">
                {PAGES.filter(([page]) => canView(page, user.role)).map(([page, label]) => (
                    <button
                        key={page}
                        type="button"
                        className={"nav-button" + (activePage === page ? " active" : "")}
                        onClick={() => onNavigate(page)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className="header-account">
                <span className="user-chip">{`${user.name} (${user.role})`}</span>
                <Button className="button-ghost" onClick={onLogout}>Logout</Button>
            </div>
        </header>
    );
}

/* ---------- DASHBOARD ---------- */

function Dashboard({ books }) {
    const totalCopies = books.reduce((sum, book) => sum + Number(book.qty || 0), 0);
    const lowStock = books.filter(book => book.qty < 2).length;
    const outOfStock = books.filter(book => book.qty === 0).length;

    const stats = [
        ["Total titles", books.length],
        ["Total copies", totalCopies],
        ["Low stock", lowStock],
        ["Out of stock", outOfStock]
    ];

    return (
        <div>
            <PageHeading
                eyebrow="OVERVIEW"
                title="Library dashboard"
                description="Monitor your collection and current book availability."
            />

            <section className="stats-grid">
                {stats.map(([label, value]) => (
                    <article className="stat-card" key={label}>
                        <span className="stat-label">{label}</span>
                        <strong className="stat-value">{value}</strong>
                    </article>
                ))}
            </section>

            <Panel
                title="Current book availability"
                eyebrow="COLLECTION"
                countText={plural(books.length, "title", "titles")}
            >
                {books.length ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {["Title", "Author", "Genre", "ISBN", "Quantity", "Status"].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id} className={book.qty < 2 ? "low-stock" : ""}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.genre}</td>
                                        <td>{book.isbn}</td>
                                        <td>{book.qty}</td>
                                        <td><StatusBadge qty={book.qty} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon="📘" title="No books yet" description="Add books from the Books page." />
                )}
            </Panel>
        </div>
    );
}

/* ---------- BOOKS ---------- */

const EMPTY_BOOK = { title: "", author: "", genre: "", isbn: "", qty: "" };

function BookForm({ books, editingBook, onSave, onClear }) {
    const [form, setForm] = useState(
        editingBook
            ? {
                title: editingBook.title,
                author: editingBook.author,
                genre: editingBook.genre,
                isbn: editingBook.isbn,
                qty: String(editingBook.qty)
            }
            : EMPTY_BOOK
    );
    const [message, setMessage] = useState(NO_MESSAGE);
    const editingId = editingBook ? editingBook.id : null;

    function update(field) {
        return event => setForm({ ...form, [field]: event.target.value });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const cleanISBN = form.isbn.trim();
        const quantity = Number(form.qty);

        if (!form.title.trim() || !form.author.trim() || !form.genre.trim() ||
            !cleanISBN || form.qty === "" || !Number.isInteger(quantity) || quantity < 0) {
            setMessage({ text: "Complete all fields correctly.", type: "error" });
            return;
        }

        if (!/^[0-9]+$/.test(cleanISBN)) {
            setMessage({ text: "ISBN must contain numbers only. Do not use spaces or hyphens.", type: "error" });
            return;
        }

        const duplicate = books.some(book => book.isbn === cleanISBN && book.id !== editingId);
        if (duplicate) {
            setMessage({ text: "That ISBN already exists in the catalogue.", type: "error" });
            return;
        }

        onSave(
            {
                title: form.title.trim(),
                author: form.author.trim(),
                genre: form.genre.trim(),
                isbn: cleanISBN,
                qty: quantity
            },
            editingId
        );
        setForm(EMPTY_BOOK);
        setMessage(NO_MESSAGE);
    }

    function handleClear() {
        setForm(EMPTY_BOOK);
        setMessage(NO_MESSAGE);
        onClear();
    }

    return (
        <Panel title={editingId ? "Update book" : "Add a book"} eyebrow="BOOK RECORD">
            <form className="form-grid" onSubmit={handleSubmit} noValidate>
                <Field id="bookTitle" label="Book title">
                    <input id="bookTitle" type="text" placeholder="e.g. Clean Code"
                        value={form.title} onChange={update("title")} required />
                </Field>
                <Field id="bookAuthor" label="Author">
                    <input id="bookAuthor" type="text" placeholder="e.g. Robert C. Martin"
                        value={form.author} onChange={update("author")} required />
                </Field>
                <Field id="bookGenre" label="Genre">
                    <input id="bookGenre" type="text" placeholder="e.g. Programming"
                        value={form.genre} onChange={update("genre")} required />
                </Field>
                <Field id="bookISBN" label="ISBN (numbers only)">
                    <input id="bookISBN" type="text" placeholder="Enter ISBN digits"
                        inputMode="numeric" title="ISBN must contain numbers only"
                        value={form.isbn} onChange={update("isbn")} required />
                </Field>
                <Field id="bookQuantity" label="Initial quantity">
                    <input id="bookQuantity" type="number" placeholder="0" min={0} step={1}
                        value={form.qty} onChange={update("qty")} required />
                </Field>

                <div className="form-action span-2">
                    <Button type="submit" className="button-primary button-large">
                        {editingId ? "Update book" : "Add book"}
                    </Button>
                    <Button className="button-secondary" onClick={handleClear}>Clear</Button>
                </div>
                <FormMessage message={message} className="span-2" />
            </form>
        </Panel>
    );
}

function BooksPage({ books, role, onSave, onDelete }) {
    const [editingId, setEditingId] = useState(null);
    const isMember = role === "member";
    const editingBook = books.find(book => book.id === editingId) || null;

    function startEdit(id) {
        setEditingId(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleSave(book, id) {
        onSave(book, id);
        setEditingId(null);
    }

    return (
        <div>
            <PageHeading
                eyebrow="CATALOGUE"
                title="Book management"
                description="Add, update and remove books while keeping every ISBN unique."
            />

            {isMember ? (
                <p className="access-notice">
                    Read-only access: Members can view the catalogue but cannot change library records.
                </p>
            ) : (
                /* key re-creates the form (and its fields) whenever a different book is edited */
                <BookForm
                    key={editingId || "new"}
                    books={books}
                    editingBook={editingBook}
                    onSave={handleSave}
                    onClear={() => setEditingId(null)}
                />
            )}

            <Panel
                title="Book list"
                eyebrow="LIBRARY COLLECTION"
                countText={plural(books.length, "title", "titles")}
            >
                {books.length ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {["Title", "Author", "Genre", "ISBN", "Quantity", "Status", "Actions"].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id} className={book.qty < 2 ? "low-stock" : ""}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.genre}</td>
                                        <td>{book.isbn}</td>
                                        <td>{book.qty}</td>
                                        <td><StatusBadge qty={book.qty} /></td>
                                        <td>
                                            <div className="action-group">
                                                {isMember ? (
                                                    <span className="muted">View only</span>
                                                ) : (
                                                    <>
                                                        <Button className="button-secondary button-small"
                                                            onClick={() => startEdit(book.id)}>Edit</Button>
                                                        <Button className="button-danger button-small"
                                                            onClick={() => onDelete(book.id)}>Delete</Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon="📘" title="Your catalogue is empty"
                        description="Add a book above to start building the collection." />
                )}
            </Panel>
        </div>
    );
}

/* ---------- TRANSACTIONS ---------- */

function TransactionsPage({ books, transactions, onProcess }) {
    const [bookId, setBookId] = useState("");
    const [type, setType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState(NO_MESSAGE);

    function handleSubmit(event) {
        event.preventDefault();

        const book = books.find(item => item.id === bookId);
        const amount = Number(quantity);

        if (!book || !type || quantity === "" || !Number.isInteger(amount) || amount < 1) {
            setMessage({ text: "Select a book, transaction type and a valid quantity.", type: "error" });
            return;
        }

        if (type === "borrow" && book.qty < amount) {
            setMessage({ text: `Not enough stock. Available copies: ${book.qty}.`, type: "error" });
            return;
        }

        onProcess(book.id, type, amount);
        setBookId("");
        setType("");
        setQuantity("");
        setMessage(NO_MESSAGE);
    }

    return (
        <div>
            <PageHeading
                eyebrow="INVENTORY"
                title="Stock transactions"
                description="Add newly arrived copies or record borrowed copies."
            />

            <Panel title="Record a transaction" eyebrow="STOCK CONTROL">
                <form className="form-grid" onSubmit={handleSubmit} noValidate>
                    <Field id="transactionBook" label="Book">
                        <select id="transactionBook" value={bookId} onChange={e => setBookId(e.target.value)}>
                            <option value="" disabled>Select a book</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {`${book.title} — ${book.qty} in stock`}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field id="transactionType" label="Transaction type">
                        <select id="transactionType" value={type} onChange={e => setType(e.target.value)}>
                            <option value="" disabled>Select type</option>
                            <option value="add">Add stock</option>
                            <option value="borrow">Borrow book</option>
                        </select>
                    </Field>

                    <Field id="transactionQuantity" label="Quantity">
                        <input id="transactionQuantity" type="number" placeholder="Enter quantity"
                            min={1} step={1} value={quantity}
                            onChange={e => setQuantity(e.target.value)} required />
                    </Field>

                    <div className="form-action span-2">
                        <Button type="submit" className="button-primary button-large">
                            Process transaction
                        </Button>
                    </div>
                    <FormMessage message={message} className="span-2" />
                </form>
            </Panel>

            <Panel
                title="Transaction history"
                eyebrow="AUDIT TRAIL"
                countText={plural(transactions.length, "record", "records")}
            >
                {transactions.length ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {["Date", "Book", "Type", "Quantity"].map(h => <th key={h}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.time}</td>
                                        <td>{item.bookTitle || "—"}</td>
                                        <td>{formatTransaction(item.type)}</td>
                                        <td>{item.quantity || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon="🧾" title="No transactions yet"
                        description="Processed stock changes will appear here." />
                )}
            </Panel>
        </div>
    );
}

/* ---------- USERS ---------- */

const EMPTY_USER = { name: "", membershipId: "", role: "", password: "" };

function UserForm({ users, editingUser, onSave, onClear }) {
    const [form, setForm] = useState(
        editingUser
            ? {
                name: editingUser.name,
                membershipId: editingUser.membershipId,
                role: editingUser.role,
                password: ""
            }
            : EMPTY_USER
    );
    const [message, setMessage] = useState(NO_MESSAGE);
    const editingId = editingUser ? editingUser.id : null;

    function update(field) {
        return event => setForm({ ...form, [field]: event.target.value });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const cleanName = form.name.trim();
        const cleanMembership = form.membershipId.trim();
        const cleanPassword = form.password;

        if (!cleanName || !cleanMembership || !form.role || (!editingId && !cleanPassword)) {
            setMessage({ text: "Complete all required fields.", type: "error" });
            return;
        }

        if (cleanPassword && cleanPassword.length < 4) {
            setMessage({ text: "Password must contain at least 4 characters.", type: "error" });
            return;
        }

        const duplicate = users.some(user =>
            user.membershipId.toLowerCase() === cleanMembership.toLowerCase() &&
            user.id !== editingId
        );
        if (duplicate) {
            setMessage({ text: "That Membership ID is already in use.", type: "error" });
            return;
        }

        onSave(
            { name: cleanName, membershipId: cleanMembership, role: form.role, password: cleanPassword },
            editingId
        );
        setForm(EMPTY_USER);
        setMessage(NO_MESSAGE);
    }

    function handleClear() {
        setForm(EMPTY_USER);
        setMessage(NO_MESSAGE);
        onClear();
    }

    return (
        <Panel title={editingId ? "Update user" : "Add a user"} eyebrow="ACCOUNT SETUP">
            <form className="form-grid" onSubmit={handleSubmit} noValidate>
                <Field id="userName" label="Full name">
                    <input id="userName" type="text" placeholder="Enter full name"
                        value={form.name} onChange={update("name")} required />
                </Field>
                <Field id="membershipId" label="Membership ID">
                    <input id="membershipId" type="text" placeholder="e.g. MEM-001"
                        value={form.membershipId} onChange={update("membershipId")} required />
                </Field>
                <Field id="userRole" label="Role">
                    <select id="userRole" value={form.role} onChange={update("role")}>
                        <option value="" disabled>Select role</option>
                        <option value="librarian">Librarian</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </Field>
                <Field id="userPassword" label="Password">
                    <input id="userPassword" type="password" autoComplete="new-password"
                        placeholder={editingId ? "Leave blank to keep current password" : "Create a password"}
                        value={form.password} onChange={update("password")} required={!editingId} />
                </Field>

                <div className="form-action span-2">
                    <Button type="submit" className="button-primary button-large">
                        {editingId ? "Update user" : "Create user"}
                    </Button>
                    <Button className="button-secondary" onClick={handleClear}>Clear</Button>
                </div>
                <FormMessage message={message} className="span-2" />
            </form>
        </Panel>
    );
}

function UsersPage({ users, onSave, onDelete }) {
    const [editingId, setEditingId] = useState(null);
    const editingUser = users.find(user => user.id === editingId) || null;

    function startEdit(id) {
        setEditingId(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleSave(user, id) {
        onSave(user, id);
        setEditingId(null);
    }

    return (
        <div>
            <PageHeading
                eyebrow="ADMINISTRATION"
                title="User management"
                description="Create, update and remove library accounts."
            />

            <UserForm
                key={editingId || "new"}
                users={users}
                editingUser={editingUser}
                onSave={handleSave}
                onClear={() => setEditingId(null)}
            />

            <Panel
                title="Registered users"
                eyebrow="ACCOUNTS"
                countText={plural(users.length, "user", "users")}
            >
                {users.length ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {["Name", "Membership ID", "Role", "Actions"].map(h => <th key={h}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.membershipId}</td>
                                        <td><span className="role-badge">{user.role}</span></td>
                                        <td>
                                            <div className="action-group">
                                                <Button className="button-secondary button-small"
                                                    onClick={() => startEdit(user.id)}>Edit</Button>
                                                <Button className="button-danger button-small"
                                                    onClick={() => onDelete(user.id)}>Delete</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon="👤" title="No users found" description="Create the first user above." />
                )}
            </Panel>
        </div>
    );
}

/* ---------- APP ---------- */

function App() {
    const [data, setData] = useLibraryData();
    const [page, setPage] = useState("dashboard");
    const { books, users, transactions, currentUser } = data;

    /* ----- auth ----- */

    /* Returns an error message, or "" when the login succeeds */
    function login(name, pass) {
        let nextUsers = users;
        let user = users.find(account =>
            account.name.toLowerCase() === name.toLowerCase() &&
            account.password === pass
        );

        /* Keeps the original test administrator available even if older
           incompatible data was left in localStorage. */
        if (!user && name.toLowerCase() === "admin" && pass === "admin123") {
            const existing = users.find(account => account.id === "u1" && account.role === "admin");
            if (existing) {
                user = { ...existing, name: "admin", password: "admin123" };
                nextUsers = users.map(account => (account.id === "u1" ? user : account));
            } else {
                user = { id: "u1", name: "admin", membershipId: "ADMIN-001", role: "admin", password: "admin123" };
                nextUsers = [user, ...users];
            }
        }

        if (!user) return "Invalid username or password.";

        setPage("dashboard");
        setData({
            ...data,
            users: nextUsers,
            currentUser: {
                id: user.id,
                name: user.name,
                membershipId: user.membershipId,
                role: user.role
            }
        });
        return "";
    }

    function logout() {
        setData({ ...data, currentUser: null });
        setPage("dashboard");
    }

    function navigate(target) {
        setPage(canView(target, currentUser.role) ? target : "dashboard");
    }

    /* ----- books ----- */

    function saveBook(book, id) {
        setData(prev => {
            if (id) {
                return {
                    ...prev,
                    books: prev.books.map(item => (item.id === id ? { ...item, ...book } : item)),
                    transactions: withTransaction(prev.transactions, "update", book.title, 0)
                };
            }
            return {
                ...prev,
                books: [...prev.books, { id: uid("b"), ...book }],
                transactions: withTransaction(prev.transactions, "add-book", book.title, book.qty)
            };
        });
    }

    function deleteBook(id) {
        const book = books.find(item => item.id === id);
        if (!book) return;
        if (!window.confirm(`Delete "${book.title}" from the catalogue?`)) return;

        setData(prev => ({
            ...prev,
            books: prev.books.filter(item => item.id !== id),
            transactions: withTransaction(prev.transactions, "delete", book.title, 0)
        }));
    }

    /* ----- stock transactions ----- */

    function processTransaction(bookId, type, amount) {
        setData(prev => {
            const book = prev.books.find(item => item.id === bookId);
            if (!book) return prev;
            return {
                ...prev,
                books: prev.books.map(item =>
                    item.id === bookId
                        ? { ...item, qty: type === "add" ? item.qty + amount : item.qty - amount }
                        : item
                ),
                transactions: withTransaction(prev.transactions, type, book.title, amount)
            };
        });
    }

    /* ----- users ----- */

    function saveUser(form, id) {
        setData(prev => {
            if (id) {
                const users = prev.users.map(user =>
                    user.id === id
                        ? {
                            ...user,
                            name: form.name,
                            membershipId: form.membershipId,
                            role: form.role,
                            password: form.password || user.password
                        }
                        : user
                );
                const updated = users.find(user => user.id === id);
                const editingSelf = prev.currentUser && prev.currentUser.id === id && updated;
                return {
                    ...prev,
                    users,
                    currentUser: editingSelf
                        ? {
                            id: updated.id,
                            name: updated.name,
                            membershipId: updated.membershipId,
                            role: updated.role
                        }
                        : prev.currentUser
                };
            }
            return { ...prev, users: [...prev.users, { id: uid("u"), ...form }] };
        });
    }

    function deleteUser(id) {
        const user = users.find(item => item.id === id);
        if (!user) return;

        if (user.id === currentUser.id) {
            alert("You cannot delete the account you are currently using.");
            return;
        }

        const adminCount = users.filter(item => item.role === "admin").length;
        if (user.role === "admin" && adminCount === 1) {
            alert("At least one administrator account must remain.");
            return;
        }

        if (!window.confirm(`Delete ${user.name}'s account?`)) return;

        setData(prev => ({ ...prev, users: prev.users.filter(item => item.id !== id) }));
    }

    /* ----- render ----- */

    if (!currentUser) {
        return <LoginPage onLogin={login} />;
    }

    /* If the role changed (e.g. admin edited their own role), fall back safely */
    const activePage = canView(page, currentUser.role) ? page : "dashboard";

    return (
        <>
            <Header
                activePage={activePage}
                user={currentUser}
                onNavigate={navigate}
                onLogout={logout}
            />

            <main className="page-shell">
                {activePage === "dashboard" && <Dashboard books={books} />}
                {activePage === "books" && (
                    <BooksPage
                        books={books}
                        role={currentUser.role}
                        onSave={saveBook}
                        onDelete={deleteBook}
                    />
                )}
                {activePage === "transactions" && (
                    <TransactionsPage
                        books={books}
                        transactions={transactions}
                        onProcess={processTransaction}
                    />
                )}
                {activePage === "users" && (
                    <UsersPage users={users} onSave={saveUser} onDelete={deleteUser} />
                )}
            </main>

            <Footer />
        </>
    );
}

export default App;
