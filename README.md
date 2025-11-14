# TaskFlow - Modern Task Management Application

![TaskFlow Screenshot](/to_do-list/client/assets/Screenshot%202025-03-30%20163613.jpg)

A feature-rich, modern task management application with productivity tracking, multiple views, and theme customization. Built with 2025's latest design trends featuring glass morphism effects, smooth animations, and an intuitive user experience.

## ✨ Features

### 🎯 **Three Ways to Get Started**
- **Guest Mode** - Try the app instantly without signing up
- **Sign Up** - Create an account for full features and cloud sync
- **Login** - Access your saved tasks from any device

### 📋 **Multi-view Interface**
  - List view, Kanban board, and Calendar view
  - Drag-and-drop task organization
  - Smooth view transitions with animations

### 📊 **Productivity Tracking**
  - Task completion statistics
  - Weekly/Monthly productivity charts
  - Real-time progress indicators

### ✅ **Smart Task Management**
  - Priority levels (Low, Medium, High)
  - Categories (Work, Personal, Health)
  - Subtasks and detailed descriptions
  - Due dates and reminders

### 🎨 **Modern 2025 Design**
  - Glass morphism effects
  - Floating labels with smooth animations
  - Gradient text and hover effects
  - Multiple themes (Light, Dark, Sunset, Forest, Ocean)
  - Customizable font sizes

### 💾 **Data Management**
  - Local storage for guest mode
  - Cloud sync for registered users
  - Import/Export functionality
  - Real-time updates with Socket.IO

## 🛠 Technologies Used

**Frontend:**
- HTML5, CSS3 (Flexbox, Grid, CSS Variables, Glass Morphism)
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome for icons
- Modern animations and transitions

**Backend:**
- Node.js
- Express.js
- MongoDB (for user data and cloud sync)
- Socket.IO (for real-time updates)
- JWT (for authentication)
- bcrypt (for password hashing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (for backend features)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Tinyu01/citi_to_do_list.git
   cd citi_to_do_list
   ```
2. Install backend dependencies:
   ```bash
   cd to_do-list/taskflow-backend
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Quick Start (No Installation)
Simply open `to_do-list/client/index.html` in your browser to use the app in guest mode with local storage!

## 🎯 User Flow

### 1️⃣ **Landing Page** (`index.html`)
When users first visit the app, they see a beautiful marketing landing page with:
- Overview of features
- Pricing options
- Demo videos
- Call-to-action buttons

**User Options:**
- **"Try Guest Mode"** → Go directly to the app without signing up
- **"Login"** → Access existing account
- **"Get Started Free"** → Create a new account

### 2️⃣ **Guest Mode** (`guest.html`)
- Full task management features
- Data stored locally in browser
- No account required
- Option to convert to full account anytime
- Perfect for trying out the app

### 3️⃣ **Authentication**
- **Login Page** (`login.html`) - Modern 2025 design with floating labels
- **Signup Page** (`signup.html`) - Quick registration with email/password
- Social login options (Google, GitHub)
- Automatic redirect after successful auth

### 4️⃣ **Dashboard** (`dashboard.html`)
- Full-featured app for authenticated users
- Cloud sync across devices
- Real-time updates
- Advanced features and analytics
- Team collaboration (coming soon)

## 📊 Project Structure
```
citi_to_do_list/
├── to_do-list/
│   ├── client/                      # Frontend files
│   │   ├── index.html               # Landing page (entry point)
│   │   ├── guest.html               # Guest mode app
│   │   ├── dashboard.html           # Authenticated user dashboard
│   │   ├── login.html               # Login page
│   │   ├── signup.html              # Signup page
│   │   ├── styles.css               # Main app styles
│   │   ├── landing-styles.css       # Landing page styles
│   │   ├── auth-styles-2025.css     # Modern auth form styles
│   │   ├── header-styles.css        # Header component styles
│   │   ├── kanban-styles.css        # Kanban board styles
│   │   ├── view-styles.css          # View switcher styles
│   │   ├── toast-styles.css         # Toast notification styles
│   │   ├── script.js                # Main app logic
│   │   ├── auth.js                  # Authentication logic
│   │   ├── guest-storage.js         # Local storage for guest mode
│   │   ├── kanban.js                # Kanban board functionality
│   │   ├── calendar.js              # Calendar view
│   │   ├── charts.js                # Chart rendering
│   │   ├── categories.js            # Category management
│   │   ├── animations.js            # UI animations
│   │   ├── real-time.js             # Socket.IO client
│   │   └── assets/                  # Images and media
│   └── taskflow-backend/            # Backend files
│       ├── server.js                # Express server
│       ├── middleware/
│       │   └── auth.js              # JWT authentication
│       ├── models/
│       │   ├── User.js              # User model
│       │   └── Task.js              # Task model
│       └── routes/
│           └── auth.js              # Auth routes
├── package.json                     # Project configuration
├── LICENSE                          # MIT License
└── README.md                        # This file
```

## 📚 Documentation

### Page Descriptions

| Page | File | Purpose |
|------|------|---------|
| 🏠 Landing | `index.html` | Marketing page, first entry point |
| 👤 Guest Mode | `guest.html` | Try app without signup (localStorage) |
| 🔐 Dashboard | `dashboard.html` | Full app for authenticated users |
| 📝 Login | `login.html` | User authentication |
| ✍️ Signup | `signup.html` | New user registration |

### API Endpoints
| Method | Endpoint        | Description        |
|--------|----------------|--------------------|
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login user        |
| GET    | /api/todos         | Get all tasks     |
| POST   | /api/todos         | Create a new task |
| PUT    | /api/todos/:id     | Update a task     |
| DELETE | /api/todos/:id     | Delete a task     |

### Keyboard Shortcuts
- **Enter** - Add new task
- **Ctrl + F** - Focus search
- **Esc** - Close modals

## 🎨 Theming
TaskFlow comes with 5 beautiful themes:
- **Light (Default)**
- **Dark**
- **Sunset**
- **Forest**
- **Ocean**

Change themes via the dropdown in the header or in Settings.

## 📱 Responsive Design
Fully responsive layout that works on:
- **Desktop** (1440px+)
- **Tablet** (768px+)
- **Mobile** (480px+)

## 📦 Future Enhancements
- ✅ ~~User authentication~~ (Completed!)
- ✅ ~~Guest mode~~ (Completed!)
- ✅ ~~Modern 2025 design~~ (Completed!)
- 🚧 Cloud sync across devices (In Progress)
- 📋 Team collaboration features
- 📱 Mobile app version (React Native)
- 📊 Advanced reporting and analytics
- 🤖 AI-powered task suggestions
- 🔔 Push notifications
- 🌐 Multi-language support

## 📖 Step-by-Step Guide: Importing Tasks from Excel

### Prerequisites
- Access to TaskFlow dashboard (authenticated user)
- Excel file (.xlsx or .xls) with tasks formatted as per sample

### Steps
1. Open `dashboard.html` in your browser and log in.
2. Click the "Import" button (Excel icon) in the dashboard header.
3. Select your Excel file (`sample-tasks-10.xlsx` is provided).
4. Review the imported tasks in the list view.
5. If you encounter errors, check the file format and required columns.

### Common Issues
- **File not uploading**: Ensure the file is .xlsx or .xls.
- **Missing columns**: Use the sample file as a template.
- **Duplicate tasks**: Imported tasks are added; remove duplicates manually.

### Troubleshooting
- Refresh the page if tasks do not appear.
- Check browser console for error messages.
- Contact support if import repeatedly fails.

## ❓ FAQ: TaskFlow Frequently Asked Questions

### Getting Started

**Q: What is TaskFlow?**  
A: TaskFlow is a modern web app for managing tasks, tracking productivity, and organizing work with multiple views and themes.

**Q: How do I use TaskFlow as a guest?**  
A: Open `guest.html` and start adding tasks—no signup required.

**Q: How do I register and log in?**  
A: Use the signup/login forms in `dashboard.html` for full features and cloud sync.

### Features

**Q: What views are available?**  
A: List, Kanban, and Calendar views. Switch using the sidebar.

**Q: Can I import/export tasks?**  
A: Yes, use the Excel import/export buttons in the dashboard.

**Q: How do I change the theme?**  
A: Use the theme selector in the header. Your choice is saved and synced if logged in.

### Troubleshooting

**Q: My tasks aren’t saving.**  
A: For guests, tasks are saved in localStorage. For users, ensure you’re logged in and the backend is running.

**Q: I can’t connect to the server.**  
A: Check your `.env` config and MongoDB service.

**Q: Excel import isn’t working.**  
A: Use the sample file format and check for required columns.

### Advanced

**Q: Can I use TaskFlow on multiple devices?**  
A: Yes, log in to sync your tasks across devices.

**Q: How do I contribute?**  
A: Fork the repo, make changes, and submit a Pull Request.

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact Me
**MASINGITA OTTIS MALULEKE** 
- **Address**: 1738, San Street, Braamfischerville, Roodepoort, 1724
- **Mobile**: 0738847449
- **Email**: masingita.maluleke@capaciti.org.za / 216135982@edu.vut.ac.za
- **LinkedIn**: [LinkedIn Profile](https://www.linkedin.com/in/thefreelancer201) 

**Project Link:** [https://tinyu01.github.io/citi_to_do_list/to_do-list/client/](https://github.com/Tinyu01/citi_to_do_list)

## 🌐 [Live Demo](https://tinyu01.github.io/citi_to_do_list/to_do-list/client/)

[Try TaskFlow Now](#)
