# TaskFlow - Modern Task Management Application

![TaskFlow Screenshot](/to_do-list/client/assets/Screenshot%202025-03-30%20163613.jpg)

A feature-rich, modern task management application with productivity tracking, multiple views, and theme customization.

## ✨ Features

- **Multi-view Interface**
  - List view, Kanban board, and Calendar view
  - Drag-and-drop task organization
- **Productivity Tracking**
  - Task completion statistics
  - Weekly/Monthly productivity charts
- **Smart Task Management**
  - Priority levels (Low, Medium, High)
  - Categories (Work, Personal, Health)
  - Subtasks and detailed descriptions
- **Customization**
  - Multiple themes (Light, Dark, Sunset, Forest, Ocean)
  - Customizable font sizes
- **Data Management**
  - Local storage persistence
  - Import/Export functionality

## 🛠 Technologies Used

**Frontend:**
- HTML5, CSS3 (Flexbox, Grid, CSS Variables)
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome for icons

**Backend:**
- Node.js
- Express.js

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   node server/server.js
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📊 Project Structure
```
taskflow/
├── client/                  # Frontend files
│   ├── index.html           # Main application HTML
│   ├── styles.css           # Global styles
│   ├── script.js            # Main application logic
│   └── charts.js            # Chart rendering logic
├── server/                  # Backend files
│   └── server.js            # Express server
├── package.json             # Project configuration
└── README.md                # Project documentation
```

## 📚 Documentation

### API Endpoints
| Method | Endpoint        | Description        |
|--------|----------------|--------------------|
| GET    | /api/todos     | Get all tasks     |
| POST   | /api/todos     | Create a new task |
| PUT    | /api/todos/:id | Update a task     |
| DELETE | /api/todos/:id | Delete a task     |

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
- User authentication
- Cloud sync across devices
- Team collaboration features
- Mobile app version
- Advanced reporting

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
