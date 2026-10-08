import { useState } from "react";
import "./App.css";

function App() {
    
    // LOGIN STATE

    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loginId, setLoginId] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // PAGE

    const [activePage, setActivePage] = useState("Dashboard");

    // USERS

    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem("libraryUsers");

        if (savedUsers) {
            return JSON.parse(savedUsers);
        }

        return [
            {
                id: 1,
                name: "System Administrator",
                membershipId: "ADMIN001",
                role: "Admin",
                password: "admin123"
            },
            {
                id: 2,
                name: "Main Librarian",
                membershipId: "LIB001",
                role: "Librarian",
                password: "lib123"
            },
            {
                id: 3,
                name: "Library Member",
                membershipId: "MEM001",
                role: "Membership",
                password: "mem123"
            }
        ];
    });

    // USER FORM
   
    const [userName, setUserName] = useState("");
    const [membershipId, setMembershipId] = useState("");
    const [userRole, setUserRole] = useState("Membership");
    const [userPassword, setUserPassword] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);

    // BOOK FORM

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState("");
    const [isbn, setIsbn] = useState("");
    const [quantity, setQuantity] = useState("");
    const [editingBookId, setEditingBookId] = useState(null);

    // BOOKS

    const [books, setBooks] = useState(() => {
        const savedBooks = localStorage.getItem("libraryBooks");

        if (savedBooks) {
            return JSON.parse(savedBooks);
        }

        return [
            {
                id: 1,
                title: "Things Fall Apart",
                author: "Chinua Achebe",
                genre: "Fiction",
                isbn: "9780385474542",
                quantity: 5
            },
            {
                id: 2,
                title: "The Alchemist",
                author: "Paulo Coelho",
                genre: "Fiction",
                isbn: "9780062315007",
                quantity: 1
            },
            {
                id: 3,
                title: "Clean Code",
                author: "Robert C. Martin",
                genre: "Programming",
                isbn: "9780132350884",
                quantity: 4
            }
        ];
    });

    // TRANSACTIONS

    const [transactions, setTransactions] = useState(() => {
        const savedTransactions =
            localStorage.getItem("libraryTransactions");

        return savedTransactions
            ? JSON.parse(savedTransactions)
            : [];
    });

    const [selectedBookId, setSelectedBookId] = useState("");
    const [transactionType, setTransactionType] = useState("add");
    const [transactionQuantity, setTransactionQuantity] = useState("");

    // SAVE FUNCTIONS

    function saveBooks(updatedBooks) {
        setBooks(updatedBooks);
        localStorage.setItem(
            "libraryBooks",
            JSON.stringify(updatedBooks)
        );
    }

    function saveTransactions(updatedTransactions) {
        setTransactions(updatedTransactions);

        localStorage.setItem(
            "libraryTransactions",
            JSON.stringify(updatedTransactions)
        );
    }

    function saveUsers(updatedUsers) {
        setUsers(updatedUsers);

        localStorage.setItem(
            "libraryUsers",
            JSON.stringify(updatedUsers)
        );
    }

    // LOGIN

    function handleLogin(event) {
        event.preventDefault();

        const foundUser = users.find(
            user =>
                user.membershipId.toLowerCase() ===
                    loginId.toLowerCase() &&
                user.password === loginPassword
        );

        if (!foundUser) {
            setLoginError(
                "Invalid membership ID or password."
            );
            return;
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(foundUser)
        );

        setCurrentUser(foundUser);
        setLoginId("");
        setLoginPassword("");
        setLoginError("");

        setActivePage("Dashboard");
    }

    // LOGOUT

    function handleLogout() {
        localStorage.removeItem("currentUser");

        setCurrentUser(null);
        setActivePage("Dashboard");
    }

    // USER MANAGEMENT

    function handleUserSubmit(event) {
        event.preventDefault();

        if (
            userName === "" ||
            membershipId === "" ||
            userPassword === ""
        ) {
            alert("Please fill in all user fields.");
            return;
        }

        if (editingUserId !== null) {
            const updatedUsers = users.map(user => {
                if (user.id === editingUserId) {
                    return {
                        ...user,
                        name: userName,
                        membershipId,
                        role: userRole,
                        password: userPassword
                    };
                }

                return user;
            });

            saveUsers(updatedUsers);

            alert("User updated successfully!");
        } else {
            const membershipExists = users.some(
                user =>
                    user.membershipId.toLowerCase() ===
                    membershipId.toLowerCase()
            );

            if (membershipExists) {
                alert("That membership ID already exists.");
                return;
            }

            const newUser = {
                id: Date.now(),
                name: userName,
                membershipId,
                role: userRole,
                password: userPassword
            };

            saveUsers([...users, newUser]);

            alert("User added successfully!");
        }

        clearUserForm();
    }

    function editUser(user) {
        setUserName(user.name);
        setMembershipId(user.membershipId);
        setUserRole(user.role);
        setUserPassword(user.password);
        setEditingUserId(user.id);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function deleteUser(id) {
        const user = users.find(user => user.id === id);

        if (!user) return;

        if (user.id === currentUser.id) {
            alert("You cannot delete the account currently logged in.");
            return;
        }

        const confirmed = window.confirm(
            `Delete ${user.name}?`
        );

        if (!confirmed) return;

        const updatedUsers = users.filter(
            user => user.id !== id
        );

        saveUsers(updatedUsers);

        if (editingUserId === id) {
            clearUserForm();
        }
    }

    function clearUserForm() {
        setUserName("");
        setMembershipId("");
        setUserRole("Membership");
        setUserPassword("");
        setEditingUserId(null);
    }

    // BOOK MANAGEMENT

    function handleBookSubmit(event) {
        event.preventDefault();

        if (
            title === "" ||
            author === "" ||
            genre === "" ||
            isbn === "" ||
            quantity === ""
        ) {
            alert("Please fill in all fields.");
            return;
        }

        if (editingBookId !== null) {
            const updatedBooks = books.map(book => {
                if (book.id === editingBookId) {
                    return {
                        ...book,
                        title,
                        author,
                        genre,
                        isbn,
                        quantity: Number(quantity)
                    };
                }

                return book;
            });

            saveBooks(updatedBooks);

            alert("Book updated successfully!");
        } else {
            const newBook = {
                id: Date.now(),
                title,
                author,
                genre,
                isbn,
                quantity: Number(quantity)
            };

            saveBooks([...books, newBook]);

            alert("Book added successfully!");
        }

        clearBookForm();
    }

    function editBook(book) {
        setTitle(book.title);
        setAuthor(book.author);
        setGenre(book.genre);
        setIsbn(book.isbn);
        setQuantity(book.quantity);
        setEditingBookId(book.id);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function deleteBook(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this book?"
        );

        if (!confirmed) return;

        const updatedBooks = books.filter(
            book => book.id !== id
        );

        saveBooks(updatedBooks);

        if (editingBookId === id) {
            clearBookForm();
        }
    }

    function clearBookForm() {
        setTitle("");
        setAuthor("");
        setGenre("");
        setIsbn("");
        setQuantity("");
        setEditingBookId(null);
    }

    // TRANSACTIONS

    function recordTransaction(event) {
        event.preventDefault();

        if (
            selectedBookId === "" ||
            transactionQuantity === ""
        ) {
            alert("Please select a book and enter a quantity.");
            return;
        }

        const quantity = Number(transactionQuantity);

        if (quantity <= 0) {
            alert("Quantity must be greater than zero.");
            return;
        }

        const book = books.find(
            book => book.id === Number(selectedBookId)
        );

        if (!book) {
            alert("Book not found.");
            return;
        }

        if (transactionType === "add") {
            const updatedBooks = books.map(currentBook => {
                if (currentBook.id === book.id) {
                    return {
                        ...currentBook,
                        quantity:
                            currentBook.quantity + quantity
                    };
                }

                return currentBook;
            });

            saveBooks(updatedBooks);

            const newTransaction = {
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                type: "Stock Added",
                quantity,
                date: new Date().toLocaleString()
            };

            saveTransactions([
                newTransaction,
                ...transactions
            ]);

            alert("Stock added successfully!");
        } else {
            if (quantity > book.quantity) {
                alert(
                    `Only ${book.quantity} copies are available.`
                );
                return;
            }

            const updatedBooks = books.map(currentBook => {
                if (currentBook.id === book.id) {
                    return {
                        ...currentBook,
                        quantity:
                            currentBook.quantity - quantity
                    };
                }

                return currentBook;
            });

            saveBooks(updatedBooks);

            const newTransaction = {
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                type: "Borrowed",
                quantity,
                date: new Date().toLocaleString()
            };

            saveTransactions([
                newTransaction,
                ...transactions
            ]);

            alert("Book borrowed successfully!");
        }

        setSelectedBookId("");
        setTransactionQuantity("");
    }

    // DASHBOARD VALUES

    const totalCopies = books.reduce(
        (total, book) => total + book.quantity,
        0
    );

    const lowStockBooks = books.filter(
        book => book.quantity < 2
    ).length;

    const borrowedBooks = transactions
        .filter(
            transaction =>
                transaction.type === "Borrowed"
        )
        .reduce(
            (total, transaction) =>
                total + transaction.quantity,
            0
        );

    // ACCESS CONTROL

    function canAccess(page) {
        if (!currentUser) return false;

        if (currentUser.role === "Admin") {
            return true;
        }

        if (currentUser.role === "Librarian") {
            return (
                page === "Dashboard" ||
                page === "Books" ||
                page === "Transactions"
            );
        }

        if (currentUser.role === "Membership") {
            return (
                page === "Dashboard" ||
                page === "Books"
            );
        }

        return false;
    }

    function goToPage(page) {
        if (canAccess(page)) {
            setActivePage(page);
        }
    }

    // LOGIN PAGE

    if (!currentUser) {
        return (
    <div className="login-page">

        <div className="login-card">

            <div className="login-logo">
                📚
            </div>

            <h1>
                Welcome to KINGS Library Management System
            </h1>

            <p className="login-subtitle">
                Please sign in to continue
            </p>

            <form
                className="login-form"
                onSubmit={handleLogin}
            >

                <div className="form-group">
                    <label>
                        Membership ID
                    </label>

                    <input
                        type="text"
                        value={loginId}
                        onChange={e =>
                            setLoginId(e.target.value)
                        }
                        placeholder="Enter membership ID"
                    />
                </div>

                <div className="form-group">
                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={loginPassword}
                        onChange={e =>
                            setLoginPassword(e.target.value)
                        }
                        placeholder="Enter password"
                    />
                </div>

                {loginError && (
                    <div className="login-error">
                        {loginError}
                    </div>
                )}

                <button
                    type="submit"
                    className="login-button"
                >
                    Sign In
                </button>

            </form>

        </div>

        <div className="login-copyright">
            © 2026 KINGS Library Management System. All Rights Reserved.
        </div>

    </div>
);
    }

    // MAIN APPLICATION

    return (
        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">

                    <div className="logo-icon">
                        📚
                    </div>

                    <div>
                        <h2>Library</h2>
                        <span>
                            Management System
                        </span>
                    </div>

                </div>

                <nav className="navigation">

                    {canAccess("Dashboard") && (
                        <button
                            className={
                                activePage === "Dashboard"
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                goToPage("Dashboard")
                            }
                        >
                            📊
                            <span>Dashboard</span>
                        </button>
                    )}

                    {canAccess("Books") && (
                        <button
                            className={
                                activePage === "Books"
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                goToPage("Books")
                            }
                        >
                            📚
                            <span>Books</span>
                        </button>
                    )}

                    {canAccess("Users") && (
                        <button
                            className={
                                activePage === "Users"
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                goToPage("Users")
                            }
                        >
                            👥
                            <span>Users</span>
                        </button>
                    )}

                    {canAccess("Transactions") && (
                        <button
                            className={
                                activePage === "Transactions"
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                goToPage("Transactions")
                            }
                        >
                            🔄
                            <span>Transactions</span>
                        </button>
                    )}

                </nav>

                <div className="sidebar-bottom">

                    <div className="logged-role">
                        <small>Logged in as</small>
                        <strong>
                            {currentUser.role}
                        </strong>
                    </div>

                    <button
                        className="nav-item logout"
                        onClick={handleLogout}
                    >
                        🚪
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN */}

            <main className="main-content">

                {/* HEADER */}

                <header className="top-header">

                    <div>
                        <h1>
                            {activePage}
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {currentUser.name}
                        </p>
                    </div>

                    <div className="admin-profile">

                        <div className="profile-avatar">
                            {currentUser.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {currentUser.name}
                            </strong>

                            <small>
                                {currentUser.role}
                            </small>
                        </div>

                    </div>

                </header>

                {/* =========================
                    DASHBOARD
                ========================= */}

                {activePage === "Dashboard" && (
                    <section className="page">

                        <div className="welcome-card">

                            <div>

                                <span className="eyebrow">
                                    LIBRARY OVERVIEW
                                </span>

                                <h2>
                                    Manage your library
                                    with ease.
                                </h2>

                                <p>
                                    Keep track of books,
                                    users and borrowing
                                    transactions from
                                    one place.
                                </p>

                            </div>

                            <div className="welcome-icon">
                                📚
                            </div>

                        </div>

                        <div className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon blue">
                                    📚
                                </div>

                                <div>
                                    <span>Total Books</span>
                                    <strong>
                                        {books.length}
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon green">
                                    📦
                                </div>

                                <div>
                                    <span>Total Copies</span>
                                    <strong>
                                        {totalCopies}
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">
                                    🔄
                                </div>

                                <div>
                                    <span>
                                        Borrowed Books
                                    </span>

                                    <strong>
                                        {borrowedBooks}
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon red">
                                    ⚠️
                                </div>

                                <div>
                                    <span>Low Stock</span>

                                    <strong>
                                        {lowStockBooks}
                                    </strong>
                                </div>
                            </div>

                        </div>

                        <div className="content-card">

                            <div className="card-header">

                                <div>
                                    <h2>
                                        Library Books
                                    </h2>

                                    <p>
                                        Current books in
                                        the library
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        goToPage("Books")
                                    }
                                >
                                    View Books →
                                </button>

                            </div>

                            <div className="table-wrapper">

                                <table>

                                    <thead>
                                        <tr>
                                            <th>Book</th>
                                            <th>Author</th>
                                            <th>ISBN</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {books.map(book => (
                                            <tr key={book.id}>

                                                <td>
                                                    {book.title}
                                                </td>

                                                <td>
                                                    {book.author}
                                                </td>

                                                <td>
                                                    {book.isbn}
                                                </td>

                                                <td>
                                                    {book.quantity}
                                                </td>

                                                <td>
                                                    {book.quantity < 2 ? (
                                                        <span className="status low">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="status available">
                                                            Available
                                                        </span>
                                                    )}
                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                )}

                {/* =========================
                    BOOKS
                ========================= */}

                {activePage === "Books" && (
                    <section className="page">

                        <div className="page-title">

                            <div>
                                <h2>
                                    Book Management
                                </h2>

                                <p>
                                    {currentUser.role ===
                                    "Membership"
                                        ? "View books currently available in the library."
                                        : "Add, update and manage library books."}
                                </p>
                            </div>

                        </div>

                        {/* MEMBERSHIP NOTICE */}

                        {currentUser.role ===
                            "Membership" && (
                            <div className="view-only-notice">
                                <div className="notice-icon">
                                    👁️
                                </div>

                                <div>
                                    <strong>
                                        View Only
                                    </strong>

                                    <p>
                                        Membership users
                                        can only view
                                        library books.
                                        You cannot add,
                                        update or delete
                                        books.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ADD / UPDATE BOOK */}

                        {currentUser.role !==
                            "Membership" && (
                            <div className="content-card add-book-card">

                                <div className="card-header">

                                    <div>

                                        <h2>
                                            {editingBookId !==
                                            null
                                                ? "Update Book"
                                                : "Add New Book"}
                                        </h2>

                                        <p>
                                            {editingBookId !==
                                            null
                                                ? "Edit the book details below."
                                                : "Enter the details of the new book."}
                                        </p>

                                    </div>

                                </div>

                                <form
                                    className="book-form"
                                    onSubmit={
                                        handleBookSubmit
                                    }
                                >

                                    <div className="form-group">
                                        <label>
                                            Book Title
                                        </label>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={e =>
                                                setTitle(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter book title"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Author
                                        </label>

                                        <input
                                            type="text"
                                            value={author}
                                            onChange={e =>
                                                setAuthor(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter author name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Genre
                                        </label>

                                        <input
                                            type="text"
                                            value={genre}
                                            onChange={e =>
                                                setGenre(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Fiction"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            ISBN
                                        </label>

                                        <input
                                            type="text"
                                            value={isbn}
                                            onChange={e => {
                                                const value =
                                                    e.target
                                                        .value;

                                                if (
                                                    /^\d*$/.test(
                                                        value
                                                    )
                                                ) {
                                                    setIsbn(
                                                        value
                                                    );
                                                }
                                            }}
                                            placeholder="Numbers only"
                                            inputMode="numeric"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={quantity}
                                            onChange={e =>
                                                setQuantity(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Number of copies"
                                        />
                                    </div>

                                    <div className="form-buttons">

                                        <button
                                            type="submit"
                                            className="primary-button"
                                        >
                                            {editingBookId !==
                                            null
                                                ? "Update Book"
                                                : "+ Add Book"}
                                        </button>

                                        {editingBookId !==
                                            null && (
                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={
                                                    clearBookForm
                                                }
                                            >
                                                Cancel
                                            </button>
                                        )}

                                    </div>

                                </form>

                            </div>
                        )}

                        {/* BOOK LIST */}

                        <div className="content-card books-list-card">

                            <div className="card-header">

                                <div>
                                    <h2>
                                        Library Books
                                    </h2>

                                    <p>
                                        {books.length} book(s)
                                        currently
                                        registered
                                    </p>
                                </div>

                            </div>

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Genre</th>
                                            <th>ISBN</th>
                                            <th>Quantity</th>
                                            <th>Status</th>

                                            {currentUser.role !==
                                                "Membership" && (
                                                <th>Action</th>
                                            )}
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {books.map(book => (
                                            <tr key={book.id}>

                                                <td>
                                                    {book.title}
                                                </td>

                                                <td>
                                                    {book.author}
                                                </td>

                                                <td>
                                                    {book.genre}
                                                </td>

                                                <td>
                                                    {book.isbn}
                                                </td>

                                                <td>
                                                    {book.quantity}
                                                </td>

                                                <td>
                                                    {book.quantity < 2 ? (
                                                        <span className="status low">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="status available">
                                                            Available
                                                        </span>
                                                    )}
                                                </td>

                                                {currentUser.role !==
                                                    "Membership" && (
                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-button"
                                                                onClick={() =>
                                                                    editBook(
                                                                        book
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                            </button>

                                                            <button
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    deleteBook(
                                                                        book.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>
                                                )}

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                )}

                {/* =========================
                    TRANSACTIONS
                ========================= */}

                {activePage === "Transactions" && (
                    <section className="page">

                        <div className="page-title">

                            <div>
                                <h2>
                                    Transactions
                                </h2>

                                <p>
                                    Add stock and record
                                    borrowed books.
                                </p>
                            </div>

                        </div>

                        <div className="content-card add-book-card">

                            <div className="card-header">

                                <div>
                                    <h2>
                                        Record Transaction
                                    </h2>

                                    <p>
                                        Add stock or deduct
                                        stock when a book
                                        is borrowed.
                                    </p>
                                </div>

                            </div>

                            <form
                                className="book-form"
                                onSubmit={
                                    recordTransaction
                                }
                            >

                                <div className="form-group">

                                    <label>
                                        Select Book
                                    </label>

                                    <select
                                        value={
                                            selectedBookId
                                        }
                                        onChange={e =>
                                            setSelectedBookId(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            -- Select a book --
                                        </option>

                                        {books.map(book => (
                                            <option
                                                key={book.id}
                                                value={book.id}
                                            >
                                                {book.title} —
                                                Stock:{" "}
                                                {
                                                    book.quantity
                                                }
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Transaction Type
                                    </label>

                                    <select
                                        value={
                                            transactionType
                                        }
                                        onChange={e =>
                                            setTransactionType(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="add">
                                            Add Stock
                                        </option>

                                        <option value="borrow">
                                            Borrow / Deduct
                                            Stock
                                        </option>

                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            transactionQuantity
                                        }
                                        onChange={e =>
                                            setTransactionQuantity(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter quantity"
                                    />

                                </div>

                                <div className="form-buttons">

                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >
                                        Record Transaction
                                    </button>

                                </div>

                            </form>

                        </div>

                        <div className="content-card">

                            <div className="card-header">

                                <div>
                                    <h2>
                                        Transaction History
                                    </h2>

                                    <p>
                                        Record of stock
                                        changes and
                                        borrowed books.
                                    </p>
                                </div>

                            </div>

                            <div className="table-wrapper">

                                <table>

                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Book</th>
                                            <th>
                                                Transaction
                                            </th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {transactions.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    style={{
                                                        textAlign:
                                                            "center",
                                                        padding:
                                                            "30px"
                                                    }}
                                                >
                                                    No transactions
                                                    recorded yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map(
                                                transaction => (
                                                    <tr
                                                        key={
                                                            transaction.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                transaction.date
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                transaction.bookTitle
                                                            }
                                                        </td>

                                                        <td>

                                                            {transaction.type ===
                                                            "Borrowed" ? (
                                                                <span className="status low">
                                                                    Borrowed
                                                                </span>
                                                            ) : (
                                                                <span className="status available">
                                                                    Stock
                                                                    Added
                                                                </span>
                                                            )}

                                                        </td>

                                                        <td>
                                                            {
                                                                transaction.quantity
                                                            }
                                                        </td>

                                                    </tr>
                                                )
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                )}

                {/* =========================
                    USER MANAGEMENT
                ========================= */}

                {activePage === "Users" &&
                    currentUser.role === "Admin" && (
                        <section className="page">

                            <div className="page-title">

                                <div>
                                    <h2>
                                        User Management
                                    </h2>

                                    <p>
                                        Manage library
                                        members, librarians
                                        and administrators.
                                    </p>
                                </div>

                            </div>

                            <div className="content-card add-book-card">

                                <div className="card-header">

                                    <div>
                                        <h2>
                                            {editingUserId !==
                                            null
                                                ? "Update User"
                                                : "Add New User"}
                                        </h2>

                                        <p>
                                            Create accounts
                                            and assign their
                                            system role.
                                        </p>
                                    </div>

                                </div>

                                <form
                                    className="book-form"
                                    onSubmit={
                                        handleUserSubmit
                                    }
                                >

                                    <div className="form-group">

                                        <label>
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={e =>
                                                setUserName(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter full name"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Membership ID
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                membershipId
                                            }
                                            onChange={e =>
                                                setMembershipId(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. MEM002"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Role
                                        </label>

                                        <select
                                            value={
                                                userRole
                                            }
                                            onChange={e =>
                                                setUserRole(
                                                    e.target
                                                        .value
                                                )
                                            }
                                        >

                                            <option value="Membership">
                                                Membership
                                            </option>

                                            <option value="Librarian">
                                                Librarian
                                            </option>

                                            <option value="Admin">
                                                Admin
                                            </option>

                                        </select>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                userPassword
                                            }
                                            onChange={e =>
                                                setUserPassword(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter password"
                                        />

                                    </div>

                                    <div className="form-buttons">

                                        <button
                                            type="submit"
                                            className="primary-button"
                                        >
                                            {editingUserId !==
                                            null
                                                ? "Update User"
                                                : "+ Add User"}
                                        </button>

                                        {editingUserId !==
                                            null && (
                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={
                                                    clearUserForm
                                                }
                                            >
                                                Cancel
                                            </button>
                                        )}

                                    </div>

                                </form>

                            </div>

                            <div className="content-card">

                                <div className="card-header">

                                    <div>
                                        <h2>
                                            System Users
                                        </h2>

                                        <p>
                                            Registered
                                            accounts and
                                            their access
                                            levels.
                                        </p>
                                    </div>

                                </div>

                                <div className="table-wrapper">

                                    <table>

                                        <thead>

                                            <tr>
                                                <th>Name</th>
                                                <th>
                                                    Membership
                                                    ID
                                                </th>
                                                <th>Role</th>
                                                <th>
                                                    Action
                                                </th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {users.map(user => (
                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            user.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            user.membershipId
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`role-badge ${user.role.toLowerCase()}`}
                                                        >
                                                            {
                                                                user.role
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-button"
                                                                onClick={() =>
                                                                    editUser(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                            </button>

                                                            <button
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    deleteUser(
                                                                        user.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </section>
                    )}

            </main>
            <footer className="site-footer">
               © 2026 KINGS Library Management System. All Rights Reserved.
            </footer>
        </div>
    );
}

export default App;
