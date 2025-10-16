// Excel import/export utility using SheetJS
// Requires: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js

// Export tasks to Excel
window.exportTasksToExcel = function(tasks, filename = 'tasks.xlsx') {
  const wsData = [
    ['Title', 'Description', 'Due Date', 'Category', 'Priority', 'Subtasks'],
    ...tasks.map(task => [
      task.text,
      task.description || '',
      task.dueDate || '',
      task.category?.name || '',
      task.priority || '',
      Array.isArray(task.subtasks) ? task.subtasks.map(s => s.text).join('; ') : ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, filename);
}

// Import tasks from Excel
window.importTasksFromExcel = function(file, callback) {
  console.log('Starting import from file:', file.name);
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log('Parsed rows from Excel:', rows);
      const tasks = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length === 0) continue; // Skip empty rows
        const [text, description, dueDate, category, priority, subtasks] = rows[i];
        if (text) { // Only add if task has a title
          tasks.push({
            text,
            description: description || '',
            dueDate: dueDate || '',
            category: { name: category || 'Work', color: '#4CAF50' },
            priority: priority || 'medium',
            subtasks: subtasks ? subtasks.split(';').map(s => ({ text: s.trim(), completed: false })) : []
          });
        }
      }
      console.log('Imported tasks:', tasks);
      callback(tasks);
    } catch (error) {
      console.error('Error importing Excel file:', error);
      alert('Error importing file: ' + error.message);
    }
  };
  reader.onerror = function(error) {
    console.error('FileReader error:', error);
    alert('Error reading file');
  };
  reader.readAsArrayBuffer(file);
}
